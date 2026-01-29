const express = require("express");
const router = express.Router();
const SocialLink = require("../controllers/sociallink-controller");
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
    const uploadDir = "public/sociallinks";
    
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
 * @route   POST /api/sociallink/addSocialLink
 * @desc    Create a new social link
 * @access  Private - Requires ADD permission on SOCIAL_LINKS resource
 * @body    { name, url, icon?, createdBy }
 */
router.post(
  "/addSocialLink",
  checkPrivilege(RESOURCES.SOCIAL_LINK, OPERATIONS.ADD),
  SocialLink.addSocialLink
);

/**
 * @route   GET /api/sociallink/getdataSocialLink
 * @desc    Get all social links
 * @access  Private - Anyone with access to social links resource
 * @query   { page?, limit?, search? }
 */
router.get(
  "/getdataSocialLink",
  checkPrivilege(RESOURCES.SOCIAL_LINK, OPERATIONS.ADD), // ✅ ADD permission includes read access
  SocialLink.getdataSocialLink
);

/**
 * @route   GET /api/sociallink/getSocialLinkByid/:id
 * @desc    Get a single social link by ID
 * @access  Private - Anyone with access to social links resource
 * @params  id - Social Link ID
 */
router.get(
  "/getSocialLinkByid/:id",
  checkPrivilege(RESOURCES.SOCIAL_LINK, OPERATIONS.ADD), // ✅ ADD permission includes read access
  SocialLink.getSocialLinkByid
);

/**
 * @route   PATCH /api/sociallink/updateSocialLink/:id
 * @desc    Update an existing social link
 * @access  Private - Requires EDIT permission on SOCIAL_LINKS resource
 * @params  id - Social Link ID
 * @body    { name?, url?, icon? }
 */
router.patch(
  "/updateSocialLink/:id",
  checkPrivilege(RESOURCES.SOCIAL_LINK, OPERATIONS.EDIT),
  SocialLink.updateCategory
);

/**
 * @route   DELETE /api/sociallink/deleteSocialLink/:id
 * @desc    Delete a social link
 * @access  Private - Requires DELETE permission on SOCIAL_LINKS resource
 * @params  id - Social Link ID
 */
router.delete(
  "/deleteSocialLink/:id",
  checkPrivilege(RESOURCES.SOCIAL_LINK, OPERATIONS.DELETE),
  SocialLink.deleteSocialLink
);

/**
 * @route   PATCH /api/sociallink/update-statuscategory
 * @desc    Update social link status (active/inactive)
 * @access  Private - Requires EDIT permission on SOCIAL_LINKS resource
 * @body    { id, status }
 */
router.patch(
  "/update-statuscategory",
  checkPrivilege(RESOURCES.SOCIAL_LINK, OPERATIONS.EDIT),
  SocialLink.updateStatusCategory
);

module.exports = router;