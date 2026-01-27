// models/client-model.js
const { Schema, model } = require("mongoose");

const sectionmasterchema = new Schema({
  name: { type: String, required: true },
  url: { type: String },
  slug: { type: String },
  status: { type: String },
  createdAt: { type: String },
  createdBy: { type: String },
  layout: { type: String },
  isRepeater: { type: Boolean, default: false }, // ✅ Add this field
  fieldsConfig: [
    {
      title: { type: String, required: true },
      type: {
        type: String,
      },
      isRequired: { type: String },
      
      // ✅ Optional: options for select fields
      options: [
        {
          label: { type: String },
          value: { type: String },
        },
      ],
    },
  ],
});

module.exports = model("sectionmaster", sectionmasterchema); // ✅ default export
