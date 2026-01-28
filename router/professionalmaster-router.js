const express = require("express");
const router = express.Router();

const ProfessionalController = require("../controllers/professionalmaster-controller");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const authenticate = require("../middlewares/auth-middleware");
const { requireRole } = require("../middlewares/require-role-middleware");
const { STATIC_ROLES } = require("../config/role-config"); 


router.use(authenticate);

// ✅ File upload handling
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = path.resolve("public/professionalmaster");

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
 * @route   POST /api/professional/addprofessional
 * @desc    Create a new professional with image upload
 * @access  Private - Super Admin, Admin only
 * @body    { name, description?, isActive?, image (file) }
 */
router.post(
  "/addprofessional",
  requireRole([STATIC_ROLES.SUPER_ADMIN, STATIC_ROLES.ADMIN]),
  upload.fields([
    { name: "image", maxCount: 1 },
  ]),
  ProfessionalController.addprofessional
);

/**
 * @route   PATCH /api/professional/updateprofessional/:id
 * @desc    Update an existing professional
 * @access  Private - Super Admin, Admin only
 * @params  id - Professional ID
 * @body    { name?, description?, isActive?, image? (file) }
 */
router.patch(
  "/updateprofessional/:id",
  requireRole([STATIC_ROLES.SUPER_ADMIN, STATIC_ROLES.ADMIN]),
  upload.fields([
    { name: "image", maxCount: 1 },
  ]),
  ProfessionalController.updateprofessional
);

/**
 * @route   GET /api/professional/getdata
 * @desc    Get all professionals with pagination and filters
 * @access  Private - Super Admin only
 * @query   { page?, limit?, search?, isActive? }
 */
router.get(
  "/getdata",
  requireRole([STATIC_ROLES.SUPER_ADMIN]),
  ProfessionalController.getdata
);

/**
 * @route   GET /api/professional/getprofessionalByid/:id
 * @desc    Get a single professional by ID
 * @access  Private - Super Admin, Admin only
 * @params  id - Professional ID
 */
router.get(
  "/getprofessionalByid/:id",
  requireRole([STATIC_ROLES.SUPER_ADMIN, STATIC_ROLES.ADMIN]),
  ProfessionalController.getprofessionalByid
);

/**
 * @route   DELETE /api/professional/deleteprofessional/:id
 * @desc    Delete a professional
 * @access  Private - Super Admin, Admin only
 * @params  id - Professional ID
 */
router.delete(
  "/deleteprofessional/:id",
  requireRole([STATIC_ROLES.SUPER_ADMIN, STATIC_ROLES.ADMIN]),
  ProfessionalController.deleteprofessional
);

/**
 * @route   PATCH /api/professional/update-statusprofessional
 * @desc    Update professional status (active/inactive)
 * @access  Private - Super Admin, Admin only
 * @body    { id, isActive }
 */
router.patch(
  "/update-statusprofessional",
  requireRole([STATIC_ROLES.SUPER_ADMIN, STATIC_ROLES.ADMIN]),
  ProfessionalController.updateStatus
);

/**
 * @route   GET /api/professional/SectionTemplateOptions
 * @desc    Get section template options for dropdown
 * @access  Private - Super Admin, Admin only
 */
router.get(
  "/SectionTemplateOptions",
  requireRole([STATIC_ROLES.SUPER_ADMIN, STATIC_ROLES.ADMIN]),
  ProfessionalController.SectionTemplateOptions
);

module.exports = router;