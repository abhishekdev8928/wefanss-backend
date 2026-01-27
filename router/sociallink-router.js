const express = require("express");
const router = express.Router();
const SocialLink = require("../controllers/sociallink-controller");
const {blogSchema } = require("../validators/auth-validator");
const validate = require("../middlewares/validate-middleware");

const multer = require("multer");
const fs = require("fs");
const path = require("path");
const bodyparser = require("body-parser");

router.use(bodyparser.urlencoded({extended:true}));
router.use(express.static(path.resolve(__dirname,'public')))
//crole
router.route("/addSocialLink").post(SocialLink.addSocialLink);
router.route("/getdataSocialLink").get(SocialLink.getdataSocialLink);
router.route("/getSocialLinkByid/:id").get(SocialLink.getSocialLinkByid);
router.route("/updateSocialLink/:id").patch(SocialLink.updateCategory);
router.route("/deleteSocialLink/:id").delete(SocialLink.deleteSocialLink);
router.route("/update-statuscategory").patch(SocialLink.updateStatusCategory);
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