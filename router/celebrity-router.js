const express = require("express");
const router = express.Router();
const Celebraty = require("../controllers/celebraty-controller");
const multer = require("multer");
const fs = require("fs");
const { checkPrivilege } = require("../middlewares/privilege-middleware");
const { RESOURCES, OPERATIONS } = require("../utils/constant/privilege-constant");
const authenticate = require("../middlewares/auth-middleware");

// ✅ Multer setup for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = "public/celebraty";
    if (!fs.existsSync("public")) fs.mkdirSync("public");
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });

// ✅ Apply authentication to all routes
router.use(authenticate);

/**
 * @route   GET /api/celebrity/professionsOptions
 * @desc    Get profession options for dropdown
 * @access  Private - Anyone with access to profession resource
 */
router.get(
  "/professionsOptions",
  checkPrivilege(RESOURCES.PROFESSION, OPERATIONS.ADD), // ✅ Changed from READ to ADD
  Celebraty.professionsOptions
);

/**
 * @route   GET /api/celebrity/sociallist
 * @desc    Get social link options for dropdown
 * @access  Private - Anyone with access to social links resource
 */
router.get(
  "/sociallist",
  checkPrivilege(RESOURCES.SOCIAL_LINK, OPERATIONS.ADD), // ✅ Changed from READ to ADD
  Celebraty.sociallist
);

/**
 * @route   GET /api/celebrity/professions
 * @desc    Get all professions
 * @access  Private - Anyone with access to profession resource
 */
router.get(
  "/professions",
  checkPrivilege(RESOURCES.PROFESSION, OPERATIONS.ADD), // ✅ Changed from READ to ADD
  Celebraty.getProfessions
);

/**
 * @route   GET /api/celebrity/fetchSectionTemplate
 * @desc    Get section templates for celebrity sections
 * @access  Private - Anyone with access to section template resource
 */
router.get(
  "/fetchSectionTemplate",
  checkPrivilege(RESOURCES.SECTION_TEMPLATE, OPERATIONS.ADD), // ✅ Changed from READ to ADD
  Celebraty.getSectionTemplates
);

/**
 * @route   GET /api/celebrity/languageOptions
 * @desc    Get language options for dropdown
 * @access  Private - Anyone with access to language resource
 */
router.get(
  "/languageOptions",
  checkPrivilege(RESOURCES.LANGUAGE, OPERATIONS.ADD), // ✅ Changed from READ to ADD
  Celebraty.languageOptions
);

/**
 * @route   POST /api/celebrity/addcelebraty
 * @desc    Create a new celebrity with image and gallery upload
 * @access  Private - Requires ADD permission on CELEBRITY resource
 * @body    { name, profession, language, biography?, dateOfBirth?, socialLinks?, image (file), gallery (files) }
 */
router.post(
  "/addcelebraty",
  checkPrivilege(RESOURCES.CELEBRITY, OPERATIONS.ADD), // ✅ Changed from CREATE to ADD
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "gallery", maxCount: 10 },
  ]),
  Celebraty.addcelebraty
);

/**
 * @route   GET /api/celebrity/getcelebraties
 * @desc    Get all celebrities with pagination and filters
 * @access  Private - Anyone with access to celebrity resource
 * @query   { page?, limit?, search?, profession?, language?, isPublished? }
 */
router.get(
  "/getcelebraties",
  checkPrivilege(RESOURCES.CELEBRITY, OPERATIONS.ADD), // ✅ Changed from READ to ADD
  Celebraty.getdata
);

/**
 * @route   PATCH /api/celebrity/update-statuscelebraty
 * @desc    Update celebrity status (active/inactive)
 * @access  Private - Requires EDIT permission on CELEBRITY resource
 * @body    { id, status }
 */
router.patch(
  "/update-statuscelebraty",
  checkPrivilege(RESOURCES.CELEBRITY, OPERATIONS.EDIT), // ✅ Changed from UPDATE to EDIT
  Celebraty.updateStatus
);

/**
 * @route   DELETE /api/celebrity/deletecelebraty/:id
 * @desc    Delete a celebrity
 * @access  Private - Requires DELETE permission on CELEBRITY resource
 * @params  id - Celebrity ID
 */
router.delete(
  "/deletecelebraty/:id",
  checkPrivilege(RESOURCES.CELEBRITY, OPERATIONS.DELETE),
  Celebraty.deletecelebraty
);

/**
 * @route   GET /api/celebrity/getcelebratyByid/:id
 * @desc    Get a single celebrity by ID with full details
 * @access  Private - Anyone with access to celebrity resource
 * @params  id - Celebrity ID
 */
router.get(
  "/getcelebratyByid/:id",
  checkPrivilege(RESOURCES.CELEBRITY, OPERATIONS.ADD), // ✅ Changed from READ to ADD
  Celebraty.getcelebratyByid
);

/**
 * @route   GET /api/celebrity/getSectionMasters
 * @desc    Get all section master types
 * @access  Private - Anyone with access to section types resource
 */
router.get(
  "/getSectionMasters",
  checkPrivilege(RESOURCES.SECTION_TYPE, OPERATIONS.ADD), // ✅ Changed from READ to ADD
  Celebraty.getSectionMasters
);

/**
 * @route   GET /api/celebrity/getCelebratySectionsByCeleb/:celebratyId
 * @desc    Get all sections for a specific celebrity
 * @access  Private - Anyone with access to celebrity resource
 * @params  celebratyId - Celebrity ID
 */
router.get(
  "/getCelebratySectionsByCeleb/:celebratyId",
  checkPrivilege(RESOURCES.CELEBRITY, OPERATIONS.ADD), // ✅ Changed from READ to ADD
  Celebraty.getCelebratySectionsByCeleb
);

/**
 * @route   PATCH /api/celebrity/updatecelebraty/:id
 * @desc    Update an existing celebrity with optional image/gallery update
 * @access  Private - Requires EDIT permission on CELEBRITY resource
 * @params  id - Celebrity ID
 * @body    { name?, profession?, language?, biography?, dateOfBirth?, socialLinks?, image? (file), gallery? (files) }
 */
router.patch(
  "/updatecelebraty/:id",
  checkPrivilege(RESOURCES.CELEBRITY, OPERATIONS.EDIT), // ✅ Changed from UPDATE to EDIT
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "gallery", maxCount: 10 },
  ]),
  Celebraty.updatecelebraty
);

module.exports = router;