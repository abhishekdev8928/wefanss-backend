const { Language } = require("../models/language-model");

function createCleanUrl(title) {
  // Convert the title to lowercase
  let cleanTitle = title.toLowerCase();
  // Remove special characters, replace spaces with dashes
  cleanTitle = cleanTitle.replace(/[^\w\s-]/g, "");
  cleanTitle = cleanTitle.replace(/\s+/g, "-");

  return cleanTitle;
}
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
// -----------Category Features------------------
//add fixed item
const addlanguage = async (req, res) => {
  try {
    console.log("Request Body:", req.body);

    const { name, code, createdBy } = req.body;
    const status = "1";
    const url = createCleanUrl(name);
    const now = new Date();
    const createdAt = formatDateDMY(now);

    // ✅ Check if language with same name OR code already exists
    const existingLanguage = await Language.findOne({
      $or: [{ name: name.trim() }, { code: code.trim() }],
    });

    if (existingLanguage) {
      let field = existingLanguage.name === name ? "Name" : "Code";
      return res.status(400).json({
        success: false,
        msg: `${field} already exist`,
      });
    }

    // ✅ Create new language
    const newLanguage = await Language.create({
      name,
      code,
      status,
      createdBy,
      url,
      createdAt,
    });

    return res.status(201).json({
      success: true,
      msg: "Language created successfully",
      data: newLanguage,
    });
  } catch (error) {
    console.error("Add Language Error:", error);
    return res
      .status(500)
      .json({ success: false, msg: "Server error", error: error.message });
  }
};

const getdatalanguage = async (req, res) => {
  try {
    const response = await Language.find();
    if (!response) {
      res.status(404).json({ msg: "No Data Found" });
      return;
    }

    res.status(200).json({ msg: response });
  } catch (error) {
    console.log(`FixedItem ${error}`);
  }
};

const getlanguageByid = async (req, res) => {
  const id = req.params.id;
  try {
    const response = await Language.find({ _id: id });
    if (!response) {
      res.status(404).json({ msg: "No Data Found" });
      return;
    }
    res.status(200).json({ msg: response });
  } catch (error) {
    console.error("Error in getdata:", error);
    res
      .status(500)
      .json({ error: "Internal Server Error", details: error.msg });
  }
};
const updateCategory = async (req, res) => {
  try {
    const id = req.params.id;
    const { name, code } = req.body;

    const existingLanguage = await Language.findById(id);
    if (!existingLanguage) {
      return res
        .status(404)
        .json({ success: false, msg: "Language not found" });
    }

    // ✅ Check duplicate name or code (excluding current id)
    const duplicate = await Language.findOne({
      $or: [{ name: name.trim() }, { code: code.trim() }],
      _id: { $ne: id },
    });

    if (duplicate) {
      const field = duplicate.name === name ? "Name" : "Code";
      return res.status(400).json({
        success: false,
        msg: `${field} already exist`,
      });
    }

    const url = createCleanUrl(name);

    const result = await Language.updateOne(
      { _id: id },
      { $set: { name, code, url } },
    );

    return res.status(200).json({
      success: true,
      msg: "Language updated successfully",
      result,
    });
  } catch (error) {
    console.error("Error updating category:", error);
    return res.status(500).json({
      success: false,
      msg: "Server error",
      error: error.message,
    });
  }
};

const updateStatusCategory = async (req, res) => {
  try {
    const { status, id } = req.body;

    const result = await Language.updateOne(
      { _id: id },
      {
        $set: {
          status: status,
        },
      },
      {
        new: true,
      },
    );
    res.status(201).json({
      msg: "Updated Successfully",
    });
  } catch (error) {
    res.status(500).json(error);
  }
};

const deletelanguage = async (req, res) => {
  try {
    const id = req.params.id;

    // 1. Find the role
    const role = await Language.findById(id);
    if (!role) {
      return res.status(404).json({ msg: "Language not found" });
    }

    // 2. Delete related privileges

    // 3. Delete the role itself
    const deleted = await Language.findByIdAndDelete(id);

    res
      .status(200)
      .json({ msg: "Language and  deleted successfully", deleted });
  } catch (error) {
    console.error("Error deleting Language:", error);
    res.status(500).json({ error: error.message });
  }
};

const categoryOptions = async (req, res) => {
  try {
    const item = await Category.find({ status: 1 });
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

module.exports = {
  addlanguage,
  getdatalanguage,
  getlanguageByid,
  updateCategory,
  deletelanguage,
  categoryOptions,
  updateStatusCategory,
};
