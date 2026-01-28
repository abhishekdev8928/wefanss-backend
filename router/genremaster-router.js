const express = require("express");
const router = express.Router();
const GenreMaster = require("../controllers/genremaster-controller");
const authenticate = require("../middlewares/auth-middleware");
const { checkPrivilege } = require("../middlewares/privilege-middleware");
const { RESOURCES, OPERATIONS } = require("../utils/constant/privilege-constant");
const multer = require("multer");
const fs = require("fs");
const path = require("path");

// ✅ Apply authentication to all routes
router.use(authenticate);

// ✅ File upload configuration (if needed in future)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = "public/genre";
    
    if (!fs.existsSync("public")) {
      fs.mkdirSync("public");
    }
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }

    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });

/**
 * @route   POST /api/genremaster/addGenreMaster
 * @desc    Create a new genre
 * @access  Private - Requires ADD permission on GENRE resource
 * @body    { name, description?, createdBy }
 */
router.post(
  "/addGenreMaster",
  checkPrivilege(RESOURCES.GENRE, OPERATIONS.ADD),
  GenreMaster.addGenreMaster
);

/**
 * @route   GET /api/genremaster/getdataGenreMaster
 * @desc    Get all genres
 * @access  Private - Anyone with access to genre resource
 * @query   { page?, limit?, search? }
 */
router.get(
  "/getdataGenreMaster",
  checkPrivilege(RESOURCES.GENRE, OPERATIONS.ADD), // ✅ ADD permission includes read access
  GenreMaster.getdataGenreMaster
);

/**
 * @route   GET /api/genremaster/getGenreMasterByid/:id
 * @desc    Get a single genre by ID
 * @access  Private - Anyone with access to genre resource
 * @params  id - Genre ID
 */
router.get(
  "/getGenreMasterByid/:id",
  checkPrivilege(RESOURCES.GENRE, OPERATIONS.ADD), // ✅ ADD permission includes read access
  GenreMaster.getGenreMasterByid
);

/**
 * @route   PATCH /api/genremaster/updateGenreMaster/:id
 * @desc    Update an existing genre
 * @access  Private - Requires EDIT permission on GENRE resource
 * @params  id - Genre ID
 * @body    { name?, description? }
 */
router.patch(
  "/updateGenreMaster/:id",
  checkPrivilege(RESOURCES.GENRE, OPERATIONS.EDIT),
  GenreMaster.updateCategory
);

/**
 * @route   DELETE /api/genremaster/deleteGenreMaster/:id
 * @desc    Delete a genre
 * @access  Private - Requires DELETE permission on GENRE resource
 * @params  id - Genre ID
 */
router.delete(
  "/deleteGenreMaster/:id",
  checkPrivilege(RESOURCES.GENRE, OPERATIONS.DELETE),
  GenreMaster.deleteGenreMaster
);

/**
 * @route   PATCH /api/genremaster/update-statuscategory
 * @desc    Update genre status (active/inactive)
 * @access  Private - Requires EDIT permission on GENRE resource
 * @body    { id, status }
 */
router.patch(
  "/update-statuscategory",
  checkPrivilege(RESOURCES.GENRE, OPERATIONS.EDIT),
  GenreMaster.updateStatusCategory
);

module.exports = router;