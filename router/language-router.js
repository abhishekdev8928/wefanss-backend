const express = require("express");
const router = express.Router();
const Language = require("../controllers/language-controller");
const authenticate = require("../middlewares/auth-middleware");
const { checkPrivilege } = require("../middlewares/privilege-middleware");
const { RESOURCES, OPERATIONS } = require("../utils/constant/privilege-constant");

router.use(authenticate);

/**
 * @route   POST /api/language/addlanguage
 * @desc    Create a new language
 * @access  Private - Requires ADD permission on LANGUAGE resource
 * @body    { name, code, createdBy }
 */
router.post(
  "/addlanguage",
  checkPrivilege(RESOURCES.LANGUAGE, OPERATIONS.ADD),
  Language.addlanguage
);

/**
 * @route   GET /api/language/getdatalanguage
 * @desc    Get all languages
 * @access  Private - Anyone with access to language resource
 * @query   { page?, limit?, search? }
 */
router.get(
  "/getdatalanguage",
  checkPrivilege(RESOURCES.LANGUAGE, OPERATIONS.ADD), // ✅ ADD permission includes read access
  Language.getdatalanguage
);

/**
 * @route   GET /api/language/getlanguageByid/:id
 * @desc    Get a single language by ID
 * @access  Private - Anyone with access to language resource
 * @params  id - Language ID
 */
router.get(
  "/getlanguageByid/:id",
  checkPrivilege(RESOURCES.LANGUAGE, OPERATIONS.ADD), // ✅ ADD permission includes read access
  Language.getlanguageByid
);

/**
 * @route   PATCH /api/language/updatelanguage/:id
 * @desc    Update an existing language
 * @access  Private - Requires EDIT permission on LANGUAGE resource
 * @params  id - Language ID
 * @body    { name?, code? }
 */
router.patch(
  "/updatelanguage/:id",
  checkPrivilege(RESOURCES.LANGUAGE, OPERATIONS.EDIT),
  Language.updateCategory
);

/**
 * @route   DELETE /api/language/deletelanguage/:id
 * @desc    Delete a language
 * @access  Private - Requires DELETE permission on LANGUAGE resource
 * @params  id - Language ID
 */
router.delete(
  "/deletelanguage/:id",
  checkPrivilege(RESOURCES.LANGUAGE, OPERATIONS.DELETE),
  Language.deletelanguage
);

/**
 * @route   PATCH /api/language/update-statuscategory
 * @desc    Update language status (active/inactive)
 * @access  Private - Requires EDIT permission on LANGUAGE resource
 * @body    { id, status }
 */
router.patch(
  "/update-statuscategory",
  checkPrivilege(RESOURCES.LANGUAGE, OPERATIONS.EDIT),
  Language.updateStatusCategory
);

module.exports = router;