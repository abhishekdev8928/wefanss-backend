const express = require("express");
const router = express.Router();

const ProfessionalController = require("../controllers/professionalmaster-controller"); // ✅ Proper naming
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

// Routes
router.post(
  "/addprofessional",
  upload.fields([
    { name: "image", maxCount: 1 },
  ]),
  ProfessionalController.addprofessional
);


router.patch(
  "/updateprofessional/:id",
  upload.fields([
    { name: "image", maxCount: 1 },
  ]),
  ProfessionalController.updateprofessional
);
router.get("/getdata", ProfessionalController.getdata);
router.get("/getprofessionalByid/:id", ProfessionalController.getprofessionalByid);
router.delete("/deleteprofessional/:id", ProfessionalController.deleteprofessional);
router.patch("/update-statusprofessional", ProfessionalController.updateStatus);
router.get("/SectionTemplateOptions", ProfessionalController.SectionTemplateOptions);



module.exports = router;
