const express = require("express");
const router = express.Router();
const GenreMaster = require("../controllers/genremaster-controller");
const {blogSchema } = require("../validators/auth-validator");
const validate = require("../middlewares/validate-middleware");

const multer = require("multer");
const fs = require("fs");
const path = require("path");
const bodyparser = require("body-parser");

router.use(bodyparser.urlencoded({extended:true}));
router.use(express.static(path.resolve(__dirname,'public')))
//crole
router.route("/addGenreMaster").post(GenreMaster.addGenreMaster);
router.route("/getdataGenreMaster").get(GenreMaster.getdataGenreMaster);
router.route("/getGenreMasterByid/:id").get(GenreMaster.getGenreMasterByid);
router.route("/updateGenreMaster/:id").patch(GenreMaster.updateCategory);
router.route("/deleteGenreMaster/:id").delete(GenreMaster.deleteGenreMaster);
router.route("/update-statuscategory").patch(GenreMaster.updateStatusCategory);
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