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
 
  sectiontemplate: [
    {
      type: Schema.Types.ObjectId,
      ref: "SectionTemplate", 
    },
  ],
});

module.exports = model("professionalmaster", professionalmasterchema);
