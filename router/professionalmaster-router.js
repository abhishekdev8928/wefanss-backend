const express = require("express");
const router = express.Router();

const ProfessionalController = require("../controllers/profession-controller");
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
 * @route   POST /api/professional
 * @desc    Create a new professional with image upload
 * @access  Private - Super Admin, Admin only
 */
router.post(
  "/",
  requireRole([STATIC_ROLES.SUPER_ADMIN, STATIC_ROLES.ADMIN]),
  upload.fields([{ name: "image", maxCount: 1 }]),
  ProfessionalController.createProfessional
);

/**
 * @route   PUT /api/professional/:id
 * @desc    Update an existing professional
 * @access  Private - Super Admin, Admin only
 */
router.put(
  "/:id",
  requireRole([STATIC_ROLES.SUPER_ADMIN, STATIC_ROLES.ADMIN]),
  upload.fields([{ name: "image", maxCount: 1 }]),
  ProfessionalController.updateProfessional
);

/**
 * @route   PATCH /api/professional/status
 * @desc    Update professional status (active/inactive)
 * @access  Private - Super Admin, Admin only
 */
router.patch(
  "/status",
  requireRole([STATIC_ROLES.SUPER_ADMIN, STATIC_ROLES.ADMIN]),
  ProfessionalController.updateProfessionalStatus
);

/**
 * @route   GET /api/professional
 * @desc    Get all professionals
 * @access  Private - Super Admin only
 */
router.get(
  "/",
  requireRole([STATIC_ROLES.SUPER_ADMIN]),
  ProfessionalController.getAllProfessionals
);

/**
 * @route   GET /api/professional/section-templates
 * @desc    Get section template options for dropdown
 * @access  Private - Super Admin, Admin only
 */
router.get(
  "/section-templates",
  requireRole([STATIC_ROLES.SUPER_ADMIN, STATIC_ROLES.ADMIN]),
  ProfessionalController.getSectionTemplateOptions
);

/**
 * @route   GET /api/professional/:id
 * @desc    Get a single professional by ID
 * @access  Private - Super Admin, Admin only
 */
router.get(
  "/:id",
  requireRole([STATIC_ROLES.SUPER_ADMIN, STATIC_ROLES.ADMIN]),
  ProfessionalController.getProfessionalById
);

/**
 * @route   DELETE /api/professional/:id
 * @desc    Delete a professional
 * @access  Private - Super Admin, Admin only
 */
router.delete(
  "/:id",
  requireRole([STATIC_ROLES.SUPER_ADMIN, STATIC_ROLES.ADMIN]),
  ProfessionalController.deleteProfessional
);

module.exports = router;