const { TriviaTypes } = require("../models/triviatypes-model");

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
const addTriviaTypes = async (req, res) => {
  try {
    const { name, createdBy } = req.body;
    const status = "1";
    const url = createCleanUrl(name);
    const now = new Date();
    const createdAt = formatDateDMY(now);

    // 🔹 Check if category already exists (case-insensitive)
    const existingCategory = await TriviaTypes.findOne({
      name: { $regex: new RegExp(`^${name}$`, "i") },
    });

    if (existingCategory) {
      return res.status(400).json({
        success: false,
        msg: "Name already exist", // ✅ Match frontend check
      });
    }

    // ✅ Create new category
    const newCategory = await TriviaTypes.create({
      name,
      status,
      createdBy,
      url,
      createdAt,
    });

    return res.status(201).json({
      success: true,
      msg: "Category created successfully",
      data: newCategory,
      userId: newCategory._id.toString(),
    });
  } catch (error) {
    console.error("Add Category Error:", error);
    return res.status(500).json({
      success: false,
      msg: "Server error",
      error: error.message,
    });
  }
};

const getdataTriviaTypes = async (req, res) => {
  try {
    const response = await TriviaTypes.find();
    if (!response) {
      res.status(404).json({ msg: "No Data Found" });
      return;
    }

    res.status(200).json({ msg: response });
  } catch (error) {
    console.log(`FixedItem ${error}`);
  }
};

const getTriviaTypesByid = async (req, res) => {
  const id = req.params.id;
  try {
    const response = await TriviaTypes.find({ _id: id });
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
    const { name } = req.body;

    const existingCategory = await TriviaTypes.findById(id);
    if (!existingCategory) {
      return res.status(404).json({ success: false, msg: "Category not found" });
    }

    // 🔹 Check for duplicate (case-insensitive, excluding current record)
    const duplicate = await TriviaTypes.findOne({
      name: { $regex: new RegExp(`^${name}$`, "i") },
      _id: { $ne: id },
    });

    if (duplicate) {
      return res.status(400).json({
        success: false,
        msg: "Name already exist", // ✅ Match frontend
      });
    }

    const url = createCleanUrl(name);

    const result = await TriviaTypes.updateOne(
      { _id: id },
      { $set: { name, url } }
    );

    return res.status(200).json({
      success: true,
      msg: "Category updated successfully",
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

    const result = await TriviaTypes.updateOne(
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

const deleteTriviaTypes = async (req, res) => {
  try {
    const id = req.params.id;

    // 1. Find the role
    const role = await TriviaTypes.findById(id);
    if (!role) {
      return res.status(404).json({ msg: "Role not found" });
    }

    // 2. Delete related privileges

    // 3. Delete the role itself
    const deleted = await TriviaTypes.findByIdAndDelete(id);

    res
      .status(200)
      .json({ msg: "Category and  deleted successfully", deleted });
  } catch (error) {
    console.error("Error deleting role:", error);
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
    console.log(`Category ${error}`);
  }
};

module.exports = {
  addTriviaTypes,
  getdataTriviaTypes,
  getTriviaTypesByid,
  updateCategory,
  deleteTriviaTypes,
  categoryOptions,
  updateStatusCategory,
};
