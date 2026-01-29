const createHttpError = require("http-errors");
const Professionalmaster = require("../models/professionalmaster-model");
const { SectionTemplate } = require("../models/sectiontemplate-model");
const Celebratysection = require("../models/celebratysection-model");
const { Celebraty } = require("../models/celebraty-model");
const fs = require("fs");
const path = require("path");

// ==================== UTILITY FUNCTIONS ====================

const createCleanUrl = (title) => {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-");
};

const formatDateDMY = (date) => {
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");
  const seconds = String(d.getSeconds()).padStart(2, "0");

  return `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;
};

// ==================== SYNC CELEBRITY SECTIONS ====================

const syncCelebritySections = async (professionId, templateIds, specificCelebrityId = null) => {
  try {
    console.log("🔄 Starting sync for profession:", professionId);

    let celebrities;
    if (specificCelebrityId) {
      const celeb = await Celebraty.findById(specificCelebrityId).select("_id");
      celebrities = celeb ? [celeb] : [];
    } else {
      celebrities = await Celebraty.find({
        professions: professionId.toString(),
      }).select("_id");
    }

    if (!celebrities.length) {
      console.log("⚠️ No celebrities found for this profession");
      return;
    }

    for (const templateId of templateIds) {
      const template = await SectionTemplate.findById(templateId).populate("sections");

      if (!template || !template.sections || template.sections.length === 0) {
        console.log(`⚠️ Template ${templateId} not found or has no sections`);
        continue;
      }

      for (const celeb of celebrities) {
        for (const section of template.sections) {
          const exists = await Celebratysection.findOne({
            celebratyId: celeb._id.toString(),
            professions: professionId.toString(),
            templateId: templateId.toString(),
            sectionmaster: section._id.toString(),
          });

          if (!exists) {
            await Celebratysection.create({
              celebratyId: celeb._id.toString(),
              professions: professionId.toString(),
              templateId: templateId.toString(),
              sectionmaster: section._id.toString(),
              sectiontemplate: section.name || template.title,
            });
            console.log(`✅ Section created: ${section.name} for celeb: ${celeb._id}`);
          }
        }
      }
    }

    console.log("🎉 Sync completed successfully!");
  } catch (error) {
    console.error("❌ Sync error:", error);
    throw error;
  }
};

// ==================== CONTROLLER FUNCTIONS ====================

// GET: Fetch section template options
const getSectionTemplateOptions = async (req, res, next) => {
  try {
    const templates = await SectionTemplate.find({ status: 1 });

    if (!templates || templates.length === 0) {
      throw createHttpError(404, "No section templates found");
    }

    return res.status(200).json({
      success: true,
      message: "Section templates fetched successfully",
      data: templates,
    });
  } catch (error) {
    next(error);
  }
};

// POST: Create new professional master
const createProfessional = async (req, res, next) => {
  try {
    const { name, slug, createdBy } = req.body;
    let sectiontemplate = [];

    // Validation
    if (!name || !name.trim()) {
      throw createHttpError(400, "Professional name is required");
    }

    if (!slug || !slug.trim()) {
      throw createHttpError(400, "Slug is required");
    }

    // Parse section template
    if (req.body.sectiontemplate) {
      try {
        sectiontemplate = JSON.parse(req.body.sectiontemplate);
      } catch (err) {
        throw createHttpError(400, "Invalid section template format");
      }
    }

    // Check if already exists
    const existingProfessional = await Professionalmaster.findOne({
      $or: [{ name: name.trim() }, { slug: slug.trim() }],
    });

    if (existingProfessional) {
      throw createHttpError(400, "Professional master already exists with this name or slug");
    }

    // Handle image upload
    const mainImage = req.files?.image?.[0]?.filename || "";
    const url = createCleanUrl(name);
    const createdAt = formatDateDMY(new Date());

    // Create new professional master
    const newProfessional = await Professionalmaster.create({
      name: name.trim(),
      slug: slug.trim(),
      image: mainImage,
      sectiontemplate,
      status: 1,
      createdAt,
      url,
      createdBy,
    });

    return res.status(201).json({
      success: true,
      message: "Professional master created successfully",
      data: {
        professional: newProfessional,
        professionalId: newProfessional._id.toString(),
      },
    });
  } catch (error) {
    next(error);
  }
};

// PUT: Update professional master
const updateProfessional = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, slug } = req.body;
    let sectiontemplate = [];

    // Validation
    if (!id) {
      throw createHttpError(400, "Professional ID is required");
    }

    // Parse section template
    if (req.body.sectiontemplate) {
      try {
        sectiontemplate = JSON.parse(req.body.sectiontemplate);
      } catch (err) {
        throw createHttpError(400, "Invalid section template format");
      }
    }

    // Find professional
    const professional = await Professionalmaster.findById(id);
    if (!professional) {
      throw createHttpError(404, "Professional master not found");
    }

    // Check for duplicates
    if (name || slug) {
      const duplicate = await Professionalmaster.findOne({
        $and: [
          { _id: { $ne: id } },
          {
            $or: [
              { name: name?.trim() || professional.name },
              { slug: slug?.trim() || professional.slug },
            ],
          },
        ],
      });

      if (duplicate) {
        throw createHttpError(400, "Professional with this name or slug already exists");
      }
    }

    // Store old templates
    const oldTemplates = professional.sectiontemplate.map((t) => t.toString());

    // Update fields
    if (name) professional.name = name.trim();
    if (slug) professional.slug = slug.trim();
    if (Array.isArray(sectiontemplate) && sectiontemplate.length > 0) {
      professional.sectiontemplate = sectiontemplate;
    }

    // Handle image update
    const newImageFile = req.files?.image?.[0] || req.file;
    if (newImageFile) {
      if (professional.image) {
        const oldPath = path.join(__dirname, "../public/professionalmaster/", professional.image);
        if (fs.existsSync(oldPath)) {
          try {
            fs.unlinkSync(oldPath);
            console.log("🗑️ Old image deleted");
          } catch (err) {
            console.error("❌ Failed to delete old image:", err);
          }
        }
      }
      professional.image = newImageFile.filename;
    }

    // Save professional
    await professional.save();
    console.log("✅ Professional saved successfully");

    // Sync celebrities if templates changed
    const newTemplates = professional.sectiontemplate.map((t) => t.toString());
    const templatesChanged =
      newTemplates.length !== oldTemplates.length ||
      newTemplates.some((t) => !oldTemplates.includes(t));

    if (templatesChanged && newTemplates.length > 0) {
      console.log("🔄 Templates changed, syncing celebrities...");
      try {
        await syncCelebritySections(id, newTemplates);
        console.log("✅ Celebrity sections synced successfully");
      } catch (syncError) {
        console.error("❌ Sync failed but professional saved:", syncError);
      }
    }

    return res.status(200).json({
      success: true,
      message: "Professional master updated successfully",
      data: {
        professional,
        professionalId: professional._id.toString(),
      },
    });
  } catch (error) {
    next(error);
  }
};

// PATCH: Update status
const updateProfessionalStatus = async (req, res, next) => {
  try {
    const { status, id } = req.body;

    // Validation
    if (!id) {
      throw createHttpError(400, "Professional ID is required");
    }

    if (status === undefined || status === null) {
      throw createHttpError(400, "Status is required");
    }

    const professional = await Professionalmaster.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!professional) {
      throw createHttpError(404, "Professional master not found");
    }

    return res.status(200).json({
      success: true,
      message: "Status updated successfully",
      data: {
        professionalId: professional._id.toString(),
        status: professional.status,
      },
    });
  } catch (error) {
    next(error);
  }
};

// GET: Fetch all professionals
// GET: Fetch all professionals
const getAllProfessionals = async (req, res, next) => {
  try {
    const professionals = await Professionalmaster.find();

    return res.status(200).json({
      success: true,
      message: "Professionals fetched successfully",
      data: professionals,
      count: professionals.length,
    });
  } catch (error) {
    next(error);
  }
};

// GET: Fetch professional by ID
const getProfessionalById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id) {
      throw createHttpError(400, "Professional ID is required");
    }

    const professional = await Professionalmaster.findById(id);

    if (!professional) {
      throw createHttpError(404, "Professional master not found");
    }

    return res.status(200).json({
      success: true,
      message: "Professional fetched successfully",
      data: professional,
    });
  } catch (error) {
    next(error);
  }
};

// DELETE: Delete professional
const deleteProfessional = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id) {
      throw createHttpError(400, "Professional ID is required");
    }

    const professional = await Professionalmaster.findByIdAndDelete(id);

    if (!professional) {
      throw createHttpError(404, "Professional master not found");
    }

    // Delete image if exists
    if (professional.image) {
      const imagePath = path.join(__dirname, "../public/professionalmaster/", professional.image);
      if (fs.existsSync(imagePath)) {
        try {
          fs.unlinkSync(imagePath);
          console.log("🗑️ Image deleted");
        } catch (err) {
          console.error("❌ Failed to delete image:", err);
        }
      }
    }

    return res.status(200).json({
      success: true,
      message: "Professional master deleted successfully",
      data: {
        professionalId: id,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ==================== EXPORTS ====================

module.exports = {
  getSectionTemplateOptions,
  createProfessional,
  updateProfessional,
  updateProfessionalStatus,
  getAllProfessionals,
  getProfessionalById,
  deleteProfessional,
  syncCelebritySections,
};