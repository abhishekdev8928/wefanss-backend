const { Schema, model } = require("mongoose");

//category


const GenreMasterSchema = new Schema({
    name: { type: String, required: true },
   
    url: { type: String },
    status: { type: String },
    createdBy :{ type: String},
     createdAt: { type: String },


});


const GenreMaster = new model('genremmaster', GenreMasterSchema);




module.exports = { GenreMaster};



