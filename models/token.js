var mongoose= require('mongoose');
var mongoosePaginate = require('mongoose-paginate');

var Schema = new mongoose.Schema({
  code:   {type: String, required: true, unique: true},
  isUsed: {type: Boolean, default: false},
  user:   {type: mongoose.Schema.Types.ObjectId, ref: "User" },
  date:   {type: Date, default: Date.now}
})

Schema.plugin(mongoosePaginate);
module.exports  =   mongoose.model('Token', Schema);
