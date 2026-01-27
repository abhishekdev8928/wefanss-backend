const express = require("express");
const router = express.Router();
const Language = require("../controllers/language-controller");
const {blogSchema } = require("../validators/auth-validator");
const validate = require("../middlewares/validate.middleware");

const multer = require("multer");
const fs = require("fs");
const path = require("path");
const bodyparser = require("body-parser");

router.use(bodyparser.urlencoded({extended:true}));
router.use(express.static(path.resolve(__dirname,'public')))

router.route("/addlanguage").post(Language.addlanguage);
router.route("/getdatalanguage").get(Language.getdatalanguage);
router.route("/getlanguageByid/:id").get(Language.getlanguageByid);
router.route("/updatelanguage/:id").patch(Language.updateCategory);
router.route("/deletelanguage/:id").delete(Language.deletelanguage);
router.route("/update-statuscategory").patch(Language.updateStatusCategory);
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