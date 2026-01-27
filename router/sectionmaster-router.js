const express = require("express");
const router = express.Router();

const SectionMasterController = require("../controllers/sectionmaster-controller"); // ✅ Proper naming
const { blogSchema } = require("../validators/auth-validator");
const validate = require("../middlewares/validate-middleware");

const multer = require("multer");
const fs = require("fs");
const path = require("path");
const bodyParser = require("body-parser");

// ✅ Middlewares
router.use(bodyParser.urlencoded({ extended: true }));
router.use(express.static(path.resolve(__dirname, "../public"))); // corrected static path

// ✅ File upload handling (if needed later)
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

// Routes
router.post(
  "/addsectionmaster",
  upload.fields([
    { name: "media", maxCount: 1 },
  ]),
  SectionMasterController.addsectionmaster
);


router.patch(
  "/updatesectionmaster/:id",
  upload.fields([
    { name: "media", maxCount: 1 },
  ]),
  SectionMasterController.updatesectionmaster
);
router.get("/getdata", SectionMasterController.getdata);
router.get("/getsectionmasterByid/:id", SectionMasterController.getsectionmasterByid);
router.delete("/deletesectionmaster/:id", SectionMasterController.deletesectionmaster);
router.patch("/updateStatus", SectionMasterController.updateStatus);



module.exports = router;
