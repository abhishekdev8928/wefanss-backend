const express = require("express");
const router = express.Router();
const SectionTemplate = require("../controllers/sectiontemplate-controller");
const {blogSchema } = require("../validators/auth-validator");
const validate = require("../middlewares/validate-middleware");

const multer = require("multer");
const fs = require("fs");
const path = require("path");
const bodyparser = require("body-parser");

router.use(bodyparser.urlencoded({extended:true}));
router.use(express.static(path.resolve(__dirname,'public')))
//crole
router.route("/addsectiontemplate").post(SectionTemplate.addsectiontemplate);
router.route("/getdatasectiontemplate").get(SectionTemplate.getdatasectiontemplate);
router.route("/getsectiontemplateByid/:id").get(SectionTemplate.getsectiontemplateByid);
router.route("/updatesectiontemplate/:id").patch(SectionTemplate.updateSectionTemplate);
router.route("/deletesectiontemplate/:id").delete(SectionTemplate.deletesectiontemplate);
router.route("/update-statuscategory").patch(SectionTemplate.updateStatusCategory);

router.get("/sectionsOptions", SectionTemplate.sectionsOptions);

router.use(bodyparser.urlencoded({extended:true}));
router.use(express.static(path.resolve(__dirname,'public')))

    const storage = multer.diskStorage({
        destination: function(req,file, cb){
        if(!fs.existsSync("public")){
            fs.mkdirSync("public");
        }
        if(!fs.existsSync("public/allimages")){
            fs.mkdirSync("public/allimages");
        }
    
        cb(null, "public/allimages");
        },
        filename: function(req,file,cb){
        cb(null, Date.now() + file.originalname);
        },
    });
  
    const upload = multer({
        storage:storage,
    })

    module.exports = router;