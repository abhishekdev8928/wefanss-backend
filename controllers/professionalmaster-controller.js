const Professionalmaster = require("../models/professionalmaster-model");
const { SectionTemplate } = require("../models/sectiontemplate-model");

const fs = require("fs");
const path = require("path");
// Utility: Create clean URL from title
function createCleanUrl(title) {
  let cleanTitle = title
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-");
  return cleanTitle;
}
const SectionTemplateOptions = async (req, res) => {
  try {
    const item = await SectionTemplate.find({ status: 1 });
    if (!item) {
      res.status(404).json({ msg: "No Data Found" });
      return;
    }

    res.status(200).json({
      msg: item,
    });
  } catch (error) {
    console.log(`Language ${error}`);
  }
};
// Utility: Format date as dd-mm-yyyy hh:mm:ss
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

// Create new Professionalmaster
const addprofessional = async (req, res) => {
  try {
    console.log("Incoming Body:", req.body);

    // ✅ Parse sectiontemplate if it comes as JSON string
    let sectiontemplate = [];
    if (req.body.sectiontemplate) {
      try {
        sectiontemplate = JSON.parse(req.body.sectiontemplate);
      } catch (err) {
        console.warn("Failed to parse sectiontemplate JSON:", err.message);
      }
    }

    const { name, slug, createdBy } = req.body;
    const url = createCleanUrl(name);
    const mainImage = req.files?.image?.[0]?.filename || "";
    const now = new Date();
    const createdAt = formatDateDMY(now);

    // ✅ Check if professionalmaster already exists (by name or slug)
    const existingProfessional = await Professionalmaster.findOne({
      $or: [{ name: name }, { slug: slug }],
    });

    if (existingProfessional) {
      return res.status(400).json({
        success: false,
        msg: "professionalmaster already exist",
      });
    }

    // ✅ Create new Professionalmaster
    const newProfessional = new Professionalmaster({
      name,
      slug,
      image: mainImage,
      sectiontemplate,
      status: 1,
      createdAt,
      url,
      createdBy,
    });

    await newProfessional.save();

    res.status(201).json({
      success: true,
      msg: "Professionalmaster added successfully",
      data: newProfessional,
    });
  } catch (error) {
    console.error("Add Professionalmaster Error:", error);
    res.status(500).json({
      success: false,
      msg: "Server error",
      error: error.message,
    });
  }
};




// utils/syncCelebritySections.js

const Celebratysection = require("../models/celebratysection-model");
const { Celebraty } = require("../models/celebraty-model");






/**
 * Sync celebrity sections for a profession
 * @param {String} professionId - Profession ID
 * @param {Array} templateIds - Array of template IDs
 * @param {String|null} specificCelebrityId - Optional: sync only for this celebrity
 */
async function syncCelebritySections(professionId, templateIds, specificCelebrityId = null) {
  try {
    console.log("🔄 Starting sync for profession:", professionId);
    console.log("📋 Templates to sync:", templateIds);

    // ✅ If specific celebrity ID provided, sync only that one
    let celebrities;
    if (specificCelebrityId) {
      const celeb = await Celebraty.findById(specificCelebrityId).select("_id");
      celebrities = celeb ? [celeb] : [];
      console.log("🎯 Syncing for specific celebrity:", specificCelebrityId);
    } else {
      // ✅ Otherwise, sync all celebrities with this profession
      celebrities = await Celebraty.find({
        professions: professionId.toString(),
      }).select("_id");
      console.log("👥 Syncing for all celebrities:", celebrities.length);
    }

    if (!celebrities.length) {
      console.log("⚠️ No celebrities found for this profession");
      return;
    }

    // ✅ Loop through each template
    for (const templateId of templateIds) {
      const template = await SectionTemplate
        .findById(templateId)
        .populate("sections");

      if (!template) {
        console.log(`⚠️ Template ${templateId} not found`);
        continue;
      }

      if (!template.sections || template.sections.length === 0) {
        console.log(`⚠️ Template ${templateId} has no sections`);
        continue;
      }

      console.log(`✅ Processing template: ${template.title} with ${template.sections.length} sections`);

      // ✅ Loop through each celebrity
      for (const celeb of celebrities) {
        // ✅ Loop through each section in template
        for (const section of template.sections) {
          // ✅ Check if section already exists
          const exists = await Celebratysection.findOne({
            celebratyId: celeb._id.toString(),
            professions: professionId.toString(),
            templateId: templateId.toString(),
            sectionmaster: section._id.toString(),
          });

          if (exists) {
            console.log(`⏭️  Section already exists for celeb ${celeb._id}`);
            continue;
          }

          // ✅ Create new section
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

    console.log("🎉 Sync completed successfully!");
  } catch (err) {
    console.error("❌ Sync error:", err);
    throw err;
  }
}





const updateprofessional = async (req, res) => {
  try {
    const professionalmasterId = req.params.id;
    const { name, slug } = req.body;

    // ✅ Parse section templates
    let sectiontemplate = [];
    if (req.body.sectiontemplate) {
      try {
        sectiontemplate = JSON.parse(req.body.sectiontemplate);
      } catch (err) {
        console.warn("❌ Failed to parse sectiontemplate JSON:", err.message);
        return res.status(400).json({
          success: false,
          msg: "Invalid sectiontemplate format",
        });
      }
    }

    // ✅ Find profession
    const professionalmaster = await Professionalmaster.findById(
      professionalmasterId
    );
    
    if (!professionalmaster) {
      return res.status(404).json({ 
        success: false, 
        msg: "Profession master not found" 
      });
    }

    // ✅ Check for duplicates (name or slug)
    if (name || slug) {
      const duplicate = await Professionalmaster.findOne({
        $and: [
          { _id: { $ne: professionalmasterId } },
          {
            $or: [
              { name: name || professionalmaster.name },
              { slug: slug || professionalmaster.slug },
            ],
          },
        ],
      });

      if (duplicate) {
        return res.status(400).json({
          success: false,
          msg: "Profession with this name or slug already exists",
        });
      }
    }

    // ✅ Store old templates to detect changes
    const oldTemplates = professionalmaster.sectiontemplate.map(t => t.toString());

    // ✅ Update fields
    if (name) professionalmaster.name = name;
    if (slug) professionalmaster.slug = slug;
    
    // ✅ Update section templates if provided
    if (Array.isArray(sectiontemplate) && sectiontemplate.length > 0) {
      professionalmaster.sectiontemplate = sectiontemplate;
    }

    // ✅ Handle image update
    const newImageFile =
      (req.files && req.files.image && req.files.image[0]) || req.file;

    if (newImageFile) {
      // Delete old image if exists
      if (professionalmaster.image) {
        const oldPath = path.join(
          __dirname,
          "../public/professionalmaster/",
          professionalmaster.image
        );
        if (fs.existsSync(oldPath)) {
          try {
            fs.unlinkSync(oldPath);
            console.log("🗑️ Old image deleted:", professionalmaster.image);
          } catch (err) {
            console.error("❌ Failed to delete old image:", err);
          }
        }
      }
      professionalmaster.image = newImageFile.filename;
    }

    // ✅ SAVE profession data
    await professionalmaster.save();
    console.log("✅ Profession saved successfully");

    // 🔥 SYNC CELEBRITIES if templates changed
    const newTemplates = professionalmaster.sectiontemplate.map(t => t.toString());
    
    // Check if templates were added or modified
    const templatesChanged = 
      newTemplates.length !== oldTemplates.length ||
      newTemplates.some(t => !oldTemplates.includes(t));

    if (templatesChanged && newTemplates.length > 0) {
      console.log("🔄 Templates changed, syncing celebrities...");
      console.log("Old templates:", oldTemplates);
      console.log("New templates:", newTemplates);
      
      try {
        await syncCelebritySections(professionalmasterId, newTemplates);
        console.log("✅ Celebrity sections synced successfully");
      } catch (syncError) {
        console.error("❌ Sync failed but profession saved:", syncError);
        // Don't fail the request, profession is already saved
      }
    } else {
      console.log("⏭️  No template changes detected, skipping sync");
    }

    res.status(200).json({
      success: true,
      msg: "Profession master updated successfully",
      data: professionalmaster,
    });
  } catch (error) {
    console.error("❌ Error updating Profession master:", error);
    res.status(500).json({
      success: false,
      msg: "Server error",
      error: error.message,
    });
  }
};

// Update status
const updateStatus = async (req, res) => {
  try {
    const { status, id } = req.body;

    await Professionalmaster.updateOne(
      { _id: id },
      { $set: { status } },
      { new: true }
    );

    res.status(200).json({ msg: "Status updated successfully" });
  } catch (error) {
    res.status(500).json({ msg: "Server Error", error: error.message });
  }
};

// Update professionalmaster

// Get all professionalmasters
const getdata = async (req, res) => {
  try {
    const response = await Professionalmaster.find();
    if (!response || response.length === 0) {
      return res.status(404).json({ msg: "No data found" });
    }

    res.status(200).json({ msg: response });
  } catch (error) {
    res.status(500).json({ msg: "Server Error", error: error.message });
  }
};

// Delete professionalmaster
const deleteprofessional = async (req, res) => {
  try {
    const id = req.params.id;
    const response = await Professionalmaster.findOneAndDelete({ _id: id });

    if (!response) {
      return res.status(404).json({ msg: "No data found" });
    }

    res.status(200).json({ msg: "professionalmaster deleted successfully" });
  } catch (error) {
    res.status(500).json({ msg: "Server Error", error: error.message });
  }
};

// Get professionalmaster by ID
const getprofessionalByid = async (req, res) => {
  try {
    const professionalmaster = await Professionalmaster.findOne({
      _id: req.params.id,
    });

    if (!professionalmaster) {
      return res.status(404).json({ msg: "No data found" });
    }

    res.status(200).json({ msg: professionalmaster });
  } catch (error) {
    res.status(500).json({ msg: "Server Error", error: error.message });
  }
};

// Export all
module.exports = {
  addprofessional,
  updateStatus,
  updateprofessional,
  getdata,
  deleteprofessional,
  getprofessionalByid,
  SectionTemplateOptions,

  syncCelebritySections
};
