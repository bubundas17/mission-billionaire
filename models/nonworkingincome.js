var findOneOrCreate = require('mongoose-find-one-or-create');
var mongoose= require('mongoose');
var mongoosePaginate = require('mongoose-paginate');

var Schema = new mongoose.Schema({
  user:{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  amount: {type: Number},
  date: {type: Date, default: Date.now}
})

Schema.plugin(mongoosePaginate);
module.exports  =   mongoose.model('NonworkingIncome', Schema);
