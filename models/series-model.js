const { Schema, model } = require("mongoose");

const seriesSchema = new Schema({
  // 🎬 Basic Series Info
  title: { type: String, required: true }, // series title
  type: { type: String },
  platform: { type: String },
  // 🧑‍🎭 Role Details
  role: { type: String }, // actor’s character name
  role_type: {
    type: String,
  },
  statusnew: { type: String }, // actor’s character name
  start_year: { type: String }, // actor’s character name

  // 🌐 Relations
  celebrityId: { type: String }, // series title

  // 🌍 Metadata
  languages: [{ type: String }],
  director: { type: String },
  end_year: { type: String },
  statusseries: { type: String },

  // 📝 Description / Notes
  notes: { type: String },

  // ⭐ Ratings
  sort: { type: String },

  // 🖼️ Media
  image: { type: String },

  // 🧩 Admin Info
  createdBy: { type: String },
  createdAt: { type: String },
  updatedAt: { type: String },

  // 🔗 SEO / Status
  url: { type: String },
  status: { type: String, default: "1" },
  genre: { type: String }, // actor’s character name
  watchLinks: [
    {
      platform: { type: String, trim: true },
      url: { type: String, trim: true },
      type: { type: String, trim: true },
    },
  ],

  seasons: [
    {
      season_no: Number,
      episodes: Number,
      year: Number,
      watch_link: String,
    },
  ],
});

const Series = model("series", seriesSchema);
module.exports = { Series };
