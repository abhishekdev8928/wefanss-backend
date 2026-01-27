// models/client-model.js
const { Schema, model } = require("mongoose");

const celebratySectionSchema = new Schema({
 sectiontemplate: { type: String },
  celebratyId: { type: String },
 professions: { type: String },
   sectionmaster: { type: String },
templateId: { type: String },

});

module.exports = model("celebratysection", celebratySectionSchema); // ✅ default export
