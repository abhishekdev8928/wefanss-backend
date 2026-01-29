const express = require("express");
const router = express.Router();
const SectionMasterController = require("../controllers/sectionmaster-controller");
const authenticate = require("../middlewares/auth-middleware");
const { checkPrivilege } = require("../middlewares/privilege-middleware");
const { RESOURCES, OPERATIONS } = require("../utils/constant/privilege-constant");
const multer = require("multer");
const fs = require("fs");
const path = require("path");

// ✅ Apply authentication to all routes
router.use(authenticate);

// ✅ File upload handling
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = path.resolve("public/sectionmaster");

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    cb(null, dir);
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

/**
 * @route   POST /api/sectionmaster/addsectionmaster
 * @desc    Create a new section master with optional media upload
 * @access  Private - Requires ADD permission on SECTION_TYPES resource
 * @body    { name, type, description?, templateId?, media? (file) }
 */
router.post(
  "/addsectionmaster",
  checkPrivilege(RESOURCES.SECTION_TYPE, OPERATIONS.ADD),
  upload.fields([
    { name: "media", maxCount: 1 },
  ]),
  SectionMasterController.addsectionmaster
);

/**
 * @route   PATCH /api/sectionmaster/updatesectionmaster/:id
 * @desc    Update an existing section master with optional media update
 * @access  Private - Requires EDIT permission on SECTION_TYPES resource
 * @params  id - Section Master ID
 * @body    { name?, type?, description?, templateId?, media? (file) }
 */
router.patch(
  "/updatesectionmaster/:id",
  checkPrivilege(RESOURCES.SECTION_TYPE, OPERATIONS.EDIT),
  upload.fields([
    { name: "media", maxCount: 1 },
  ]),
  SectionMasterController.updatesectionmaster
);

/**
 * @route   GET /api/sectionmaster/getdata
 * @desc    Get all section masters with pagination and filters
 * @access  Private - Anyone with access to section types resource
 * @query   { page?, limit?, search?, type?, isActive? }
 */
router.get(
  "/getdata",
  checkPrivilege(RESOURCES.SECTION_TYPE, OPERATIONS.ADD), // ✅ ADD permission includes read access
  SectionMasterController.getdata
);

/**
 * @route   GET /api/sectionmaster/getsectionmasterByid/:id
 * @desc    Get a single section master by ID
 * @access  Private - Anyone with access to section types resource
 * @params  id - Section Master ID
 */
router.get(
  "/getsectionmasterByid/:id",
  checkPrivilege(RESOURCES.SECTION_TYPE, OPERATIONS.ADD), // ✅ ADD permission includes read access
  SectionMasterController.getsectionmasterByid
);

/**
 * @route   DELETE /api/sectionmaster/deletesectionmaster/:id
 * @desc    Delete a section master
 * @access  Private - Requires DELETE permission on SECTION_TYPES resource
 * @params  id - Section Master ID
 */
router.delete(
  "/deletesectionmaster/:id",
  checkPrivilege(RESOURCES.SECTION_TYPE, OPERATIONS.DELETE),
  SectionMasterController.deletesectionmaster
);

/**
 * @route   PATCH /api/sectionmaster/updateStatus
 * @desc    Update section master status (active/inactive)
 * @access  Private - Requires EDIT permission on SECTION_TYPES resource
 * @body    { id, status }
 */
router.patch(
  "/updateStatus",
  checkPrivilege(RESOURCES.SECTION_TYPE, OPERATIONS.EDIT),
  SectionMasterController.updateStatus
);

module.exports = router;