// models/client-model.js
const { Schema, model } = require("mongoose");

const professionalmasterchema = new Schema({
  name: { type: String, required: true },
  url: { type: String },
  slug: { type: String },
  status: { type: String },
  createdAt: { type: String },
  createdBy: { type: String },
  image: { type: String },
  // ✅ New field for multiple section templates
  sectiontemplate: [
    {
      type: Schema.Types.ObjectId,
      ref: "SectionTemplate", // Must match your SectionTemplate model name
    },
  ],
});

module.exports = model("professionalmaster", professionalmasterchema); // ✅ default export
