const { Schema, model } = require("mongoose");

//category


const languageSchema = new Schema({
    name: { type: String, required: true },
       code: { type: String, required: true },

    url: { type: String },
    status: { type: String },
    createdBy :{ type: String},
     createdAt: { type: String },


});


const Language = new model('language',languageSchema);




module.exports = { Language};



