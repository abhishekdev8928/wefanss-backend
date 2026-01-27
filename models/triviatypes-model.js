const { Schema, model } = require("mongoose");

//category


const triviaTypesSchema = new Schema({
    name: { type: String, required: true },
   
    url: { type: String },
    status: { type: String },
    createdBy :{ type: String},
     createdAt: { type: String },


});


const TriviaTypes = new model('triviaTypes', triviaTypesSchema);




module.exports = { TriviaTypes};



