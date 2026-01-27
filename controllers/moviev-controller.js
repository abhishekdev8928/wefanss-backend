const { Moviev } = require("../models/moviev-model");
const { Language } = require("../models/language-model");
const { GenreMaster } = require("../models/genremaster-model");

function createCleanUrl(title) {
  // Convert the title to lowercase
  let cleanTitle = title.toLowerCase();
  // Remove special characters, replace spaces with dashes
  cleanTitle = cleanTitle.replace(/[^\w\s-]/g, "");
  cleanTitle = cleanTitle.replace(/\s+/g, "-");

  return cleanTitle;
}

// ✅ Get category dropdown options
const GenreMasterOptions = async (req, res) => {
  try {
    const categories = await GenreMaster.find({ status: 1 });
    if (!categories.length)
      return res.status(404).json({ msg: "No categories found" });
    res.status(200).json({ msg: categories });
  } catch (error) {
    console.error("Category Fetch Error:", error);
    res.status(500).json({ msg: "Server error" });
  }
};

//add project
const languageOptions = async (req, res) => {
  try {
    const item = await Language.find({ status: 1 });
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

const addMoviev = async (req, res) => {
  try {
    const {
      title,
      release_year,
      release_date,
      role,
      role_type,
      languages,
      director,
      producer,
      cast,
      genre,
      notes,
      rating,
      platform_rating,
      celebrityId, // movie belongs to this celebrity
      createdBy,
      watchLinks, // ✅ new field from frontend
      awards,
      sort,
      statusnew,
    } = req.body;

    // ✅ Single poster/thumbnail image
    const profileImage = req.files?.image?.[0]
      ? req.files.image[0].filename
      : null;

    // ✅ Multiple gallery images (if supported)
    const galleryImages = req.files?.gallery
      ? req.files.gallery.map((file) => file.filename)
      : [];

    const now = new Date();
    const createdAt = formatDateDMY(now);

    // ✅ Duplicate title check
    const existingMoviev = await Moviev.findOne({ title });
    if (existingMoviev) {
      return res
        .status(400)
        .json({ status: false, msg: "Movie already exists with this title" });
    }

    // ✅ Create clean SEO-friendly URL
    const url = createCleanUrl(title);

    // ✅ Parse languages
    let parsedLanguages = [];
    try {
      parsedLanguages = languages ? JSON.parse(languages) : [];
    } catch {
      parsedLanguages = Array.isArray(languages) ? languages : [];
    }

    let parsedWatchLinks = [];
    try {
      parsedWatchLinks = watchLinks ? JSON.parse(watchLinks) : [];
    } catch (err) {
      console.error("Invalid watchLinks JSON:", err);
    }
    // ✅ Create new Movie document
    const newMoviev = await Moviev.create({
      title,
      release_year,
      release_date,
      role,
      role_type,
      languages: parsedLanguages,
      director,
      producer,
      cast,
      notes,
      rating,
      genre,
      platform_rating,
      celebrityId,
      image: profileImage,
      gallery: galleryImages,
      watchLinks: parsedWatchLinks, // ✅ save in MongoDB
      createdBy,
      createdAt,
      status: "1",
      awards,
      sort,
      statusnew,
      url,
    });

    return res.status(201).json({
      status: true,
      msg: "Movie added successfully",
      data: newMoviev,
    });
  } catch (error) {
    console.error("Add Moviev Error:", error);
    res
      .status(500)
      .json({ status: false, msg: "Internal Server Error", error });
  }
};

//update status

const updateStatus = async (req, res) => {
  try {
    const { status, id } = req.body;

    const result = await Moviev.updateOne(
      { _id: id },
      {
        $set: {
          status: status,
        },
      },
      {
        new: true,
      }
    );
    res.status(201).json({
      msg: "Updated Successfully",
    });
  } catch (error) {
    res.status(500).json(error);
  }
};

const updatemoviev = async (req, res) => {
  try {
    const id = req.params.id;
    const {
      title,
      release_year,
      release_date,
      role,
      role_type,
      languages,
      director,
      producer,
      cast,
      notes,
      rating,
      platform_rating,
      old_image,
      watchLinks,
      awards,
      genre,
      sort,
      statusnew,
    } = req.body;

    console.log("🧩 Received watchLinks:", watchLinks);
    console.log("🧩 Type of watchLinks:", typeof watchLinks);

    const profileImage = req.files?.image?.[0]
      ? req.files.image[0].filename
      : null;

    // ✅ Parse languages safely
    let parsedLanguages = [];
    try {
      if (typeof languages === "string") {
        parsedLanguages = JSON.parse(languages);
      } else if (Array.isArray(languages)) {
        parsedLanguages = languages;
      }
    } catch {
      parsedLanguages = [];
    }

    // ✅ Parse watchLinks safely
    let parsedWatchLinks = [];
    try {
      if (typeof watchLinks === "string") {
        if (
          watchLinks.trim().startsWith("[") &&
          watchLinks.trim().endsWith("]")
        ) {
          parsedWatchLinks = JSON.parse(watchLinks);
        } else {
          parsedWatchLinks = [];
        }
      } else if (Array.isArray(watchLinks)) {
        parsedWatchLinks = watchLinks;
      } else if (watchLinks && typeof watchLinks === "object") {
        parsedWatchLinks = [watchLinks];
      }
    } catch (err) {
      console.error("Invalid watchLinks JSON:", err);
      parsedWatchLinks = [];
    }

    // ✅ Sanitize each element
    parsedWatchLinks = parsedWatchLinks.filter(
      (wl) => wl && typeof wl === "object" && !Array.isArray(wl)
    );

    const updateData = {
      title,
      release_year,
      release_date,
      role,
      role_type,
      languages: parsedLanguages,
      director,
      producer,
      cast,
      notes,
      genre,
      rating,
      platform_rating,
      awards,
      sort,
      statusnew,
      watchLinks: parsedWatchLinks,
      updatedAt: new Date(),
    };

    if (profileImage) updateData.image = profileImage;
    else if (old_image) updateData.image = old_image;

    const result = await Moviev.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true }
    );

    if (!result) {
      return res.status(404).json({ status: false, msg: "Movie not found" });
    }

    res.status(200).json({
      status: true,
      msg: "Movie updated successfully",
      data: result,
    });
  } catch (error) {
    console.error("Update Moviev Error:", error);
    res.status(500).json({ status: false, msg: "Server error", error });
  }
};

//get table data

const getMoviesByCelebrity = async (req, res) => {
  try {
    const { celebrityId } = req.params;
    const movies = await Moviev.find({ celebrityId });
    res.json({ status: true, msg: movies });
  } catch (error) {
    console.error("Get Movies Error:", error);
    res.status(500).json({ status: false, msg: "Internal Server Error" });
  }
};

//delete

const deletemoviev = async (req, res) => {
  try {
    const id = req.params.id;
    const response = await Moviev.findOneAndDelete({ _id: id });

    if (!response) {
      return res.status(404).json({
        status: false,
        msg: "No Data Found",
      });
    }

    return res.status(200).json({
      status: true,
      msg: "Celebrity deleted successfully",
      data: response,
    });
  } catch (error) {
    console.error("Delete Moviev error:", error);
    res.status(500).json({
      status: false,
      msg: "Internal Server Error",
      error: error.message,
    });
  }
};

//for edit

// backend: controller
const getmovievByid = async (req, res) => {
  try {
    const project = await Moviev.findOne({ _id: req.params.id });

    if (!project) {
      return res.status(404).json({ msg: "No Data Found" });
    }

    res.status(200).json({ msg: project }); // msg is an object
  } catch (error) {
    res
      .status(500)
      .json({ msg: "Internal Server Error", error: error.message });
  }
};

module.exports = {
  addMoviev,
  languageOptions,
  updateStatus,
  updatemoviev,
  getMoviesByCelebrity,
  deletemoviev,
  getmovievByid,
  GenreMasterOptions,
};
