var mongoose  = require('mongoose');
var mongoosePaginate = require('mongoose-paginate');

var Schema    = new mongoose.Schema({
  user:{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  amount: Number,
  discription: String,
  date: {type:Date, default: Date.now}
});

Schema.plugin(mongoosePaginate);
module.exports  = mongoose.model('Referialincome', Schema);
