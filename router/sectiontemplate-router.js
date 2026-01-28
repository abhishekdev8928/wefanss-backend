const express = require("express");
const router = express.Router();
const SectionTemplate = require("../controllers/sectiontemplate-controller");
const authenticate = require("../middlewares/auth-middleware");
const { checkPrivilege } = require("../middlewares/privilege-middleware");
const { RESOURCES, OPERATIONS } = require("../utils/constant/privilege-constant");
const multer = require("multer");
const fs = require("fs");
const path = require("path");


router.use(authenticate);


/**
 * @route   POST /api/sectiontemplate/addsectiontemplate
 * @desc    Create a new section template
 * @access  Private - Requires ADD permission on SECTION_TEMPLATE resource
 * @body    { name, sectionTypeId, fields?, description?, createdBy }
 */
router.post(
  "/addsectiontemplate",
  checkPrivilege(RESOURCES.SECTION_TEMPLATE, OPERATIONS.ADD),
  SectionTemplate.addsectiontemplate
);

/**
 * @route   GET /api/sectiontemplate/getdatasectiontemplate
 * @desc    Get all section templates with pagination and filters
 * @access  Private - Anyone with access to section template resource
 * @query   { page?, limit?, search?, sectionTypeId?, isActive? }
 */
router.get(
  "/getdatasectiontemplate",
  checkPrivilege(RESOURCES.SECTION_TEMPLATE, OPERATIONS.ADD), // ✅ ADD permission includes read access
  SectionTemplate.getdatasectiontemplate
);

/**
 * @route   GET /api/sectiontemplate/getsectiontemplateByid/:id
 * @desc    Get a single section template by ID
 * @access  Private - Anyone with access to section template resource
 * @params  id - Section Template ID
 */
router.get(
  "/getsectiontemplateByid/:id",
  checkPrivilege(RESOURCES.SECTION_TEMPLATE, OPERATIONS.ADD), // ✅ ADD permission includes read access
  SectionTemplate.getsectiontemplateByid
);

/**
 * @route   PATCH /api/sectiontemplate/updatesectiontemplate/:id
 * @desc    Update an existing section template
 * @access  Private - Requires EDIT permission on SECTION_TEMPLATE resource
 * @params  id - Section Template ID
 * @body    { name?, sectionTypeId?, fields?, description? }
 */
router.patch(
  "/updatesectiontemplate/:id",
  checkPrivilege(RESOURCES.SECTION_TEMPLATE, OPERATIONS.EDIT),
  SectionTemplate.updateSectionTemplate
);

/**
 * @route   DELETE /api/sectiontemplate/deletesectiontemplate/:id
 * @desc    Delete a section template
 * @access  Private - Requires DELETE permission on SECTION_TEMPLATE resource
 * @params  id - Section Template ID
 */
router.delete(
  "/deletesectiontemplate/:id",
  checkPrivilege(RESOURCES.SECTION_TEMPLATE, OPERATIONS.DELETE),
  SectionTemplate.deletesectiontemplate
);

/**
 * @route   PATCH /api/sectiontemplate/update-statuscategory
 * @desc    Update section template status (active/inactive)
 * @access  Private - Requires EDIT permission on SECTION_TEMPLATE resource
 * @body    { id, status }
 */
router.patch(
  "/update-statuscategory",
  checkPrivilege(RESOURCES.SECTION_TEMPLATE, OPERATIONS.EDIT),
  SectionTemplate.updateStatusCategory
);

/**
 * @route   GET /api/sectiontemplate/sectionsOptions
 * @desc    Get active section templates for dropdown options
 * @access  Private - Anyone with access to section template resource
 */
router.get(
  "/sectionsOptions",
  checkPrivilege(RESOURCES.SECTION_TEMPLATE, OPERATIONS.ADD), // ✅ ADD permission includes read access
  SectionTemplate.sectionsOptions
);

module.exports = router;