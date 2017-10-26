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
    address: {
      country: String,
      state: String,
   }
 },
 tkc:        {type: String},
 upTree:     [{type: mongoose.Schema.Types.ObjectId, ref: "User"}], // Last 10 Users Above him.["Ram", "bubun", "subham", "Rakesh"] etc...
 referedBy:  {type: mongoose.Schema.Types.ObjectId, ref: "User"},   // Name of the user who refered.
 credits:    {type: Number, default: 0},
 isAdmin:    {type: Boolean, default: false},
 isActive:   {type: Boolean, default: false},
 userGroup:  {type: Number, default: 1     },  // 1 for normal, 2 for gold, 3 for platinum and 4 for dimond.
 isGoldUser:   {type: Boolean, default: false},
 isPlatinumUser:{type: Boolean, default: false},
 isDimondUser: {type: Boolean, default: false}
});

postSchema.plugin(mongoosePaginate);
module.exports  = mongoose.model('User', postSchema);
