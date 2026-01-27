const express = require("express");
const router = express.Router();
const Celebraty = require("../controllers/celebraty-controller");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const bodyparser = require("body-parser");

router.use(bodyparser.urlencoded({ extended: true }));
router.use(express.static(path.resolve(__dirname, 'public')));

// Multer setup for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = "public/celebraty";
    if (!fs.existsSync("public")) fs.mkdirSync("public");
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  },
});

const upload = multer({ storage: storage });

// Routes
router.get("/professionsOptions", Celebraty.professionsOptions);
router.get("/sociallist", Celebraty.sociallist);
router.get("/professions", Celebraty.getProfessions);
router.get("/fetchSectionTemplate", Celebraty.getSectionTemplates);

router.get("/languageOptions", Celebraty.languageOptions);
// In router file
router.post(
  "/addcelebraty",
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "gallery", maxCount: 10 }, // ✅ allow multiple gallery uploads
  ]),
  Celebraty.addcelebraty
);
router.get("/getcelebraties", Celebraty.getdata);

router.get("/getcelebraties", Celebraty.getdata);
router.patch("/update-statuscelebraty", Celebraty.updateStatus);
router.delete("/deletecelebraty/:id", Celebraty.deletecelebraty);
router.get("/getcelebratyByid/:id", Celebraty.getcelebratyByid);
router.get("/getSectionMasters", Celebraty.getSectionMasters);
router.get("/getCelebratySectionsByCeleb/:celebratyId", Celebraty.getCelebratySectionsByCeleb);

router.patch(
  "/updatecelebraty/:id",
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "gallery", maxCount: 10 }, // ✅ allow multiple gallery uploads
  ]),
  Celebraty.updatecelebraty
);

module.exports = router;
