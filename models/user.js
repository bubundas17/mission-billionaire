var mongoose= require('mongoose');
var mongoosePaginate = require('mongoose-paginate');
var SchemaTypes = mongoose.Schema.Types;

var postSchema = new mongoose.Schema({
  name:{
    type: String,
    min: 1,
    required: true
  },
  username:{
    type: String,
    min: 6,
    unique: true
  },
  password:{
    type: String,
    required: true
  },
  salt:{
    type: String
  },
  meta: {
    email: {type: String, required: true},
    phone: {type: Number, required: true},
    dateOfBarth: String,
 },
 bitcoin:    {type: String},
 totalReferred: {type: Number, default: 0},    // Maximum 2
 upTree:     [{type: mongoose.Schema.Types.ObjectId, ref: "User"}], // Last 10 Users Above him.["Ram", "bubun", "subham", "Rakesh"] etc...
 referedBy:  {type: mongoose.Schema.Types.ObjectId, ref: "User"},   // Name of the user who refered.
 credits:    {type: Number, default: 0},
 isAdmin:    {type: Boolean, default: false},
 isActive:   {type: Boolean, default: false},
});

postSchema.plugin(mongoosePaginate);
module.exports  = mongoose.model('User', postSchema);
