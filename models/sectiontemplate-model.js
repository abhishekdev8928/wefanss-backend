const { Schema, model } = require("mongoose");

//category


const sectiontemplateSchema = new Schema({
    title: { type: String, required: true },
sections: [
    {
      type: Schema.Types.ObjectId,
      ref: "sectionmaster", 
    },
  ],
    url: { type: String },
    status: { type: String },
    createdBy :{ type: String},
     createdAt: { type: String },


});


const SectionTemplate = new model('sectiontemplate',sectiontemplateSchema);




module.exports = { SectionTemplate};



