const { Schema, model } = require("mongoose");

//Fixed item master
const celebratySchema = new Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true },
  shortinfo: { type: String, required: true },
  statusnew: { type: String, required: true },
  professions: [String],  // ✅ Fixed - Array of strings
  languages: [String],    // ✅ Fixed - Array of strings (was String)
  gender: { type: String },
  dob: { type: String },

  biography: { type: String, required: true },
  image: {
    type: String,
  },
  gallery: [String], 
  createdBy: { type: String }, 
  updatedAt: { type: String }, 
  socialLinks: [
    {
      platform: { type: String }, // social link _id or platform key
      name: { type: String }, // display name (e.g. "Facebook")
      url: { type: String }, // default URL
      customUrl: { type: String }, // custom URL entered by user
    },
  ],

  url: { type: String },
  status: { type: String },
  createdAt: { type: String }, // 👈 optional if you're adding manually
}); 

const Celebraty = new model("celebraty", celebratySchema);

module.exports = { Celebraty };