const { Schema, model } = require("mongoose");

//category


const SocialLinkSchema = new Schema({
    name: { type: String, required: true },
   
    url: { type: String },
    status: { type: String },
    createdBy :{ type: String},
     createdAt: { type: String },


});


const SocialLink = new model('socialLink', SocialLinkSchema);




module.exports = { SocialLink};



