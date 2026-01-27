const express = require("express");
const router = express.Router();
const TriviaTypes = require("../controllers/triviatypes-controller");
const {blogSchema } = require("../validators/auth-validator");
const validate = require("../middlewares/validate-middleware");

const multer = require("multer");
const fs = require("fs");
const path = require("path");
const bodyparser = require("body-parser");

router.use(bodyparser.urlencoded({extended:true}));
router.use(express.static(path.resolve(__dirname,'public')))
//crole
router.route("/addTriviaTypes").post(TriviaTypes.addTriviaTypes);
router.route("/getdataTriviaTypes").get(TriviaTypes.getdataTriviaTypes);
router.route("/getTriviaTypesByid/:id").get(TriviaTypes.getTriviaTypesByid);
router.route("/updateTriviaTypes/:id").patch(TriviaTypes.updateCategory);
router.route("/deleteTriviaTypes/:id").delete(TriviaTypes.deleteTriviaTypes);
router.route("/update-statuscategory").patch(TriviaTypes.updateStatusCategory);
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