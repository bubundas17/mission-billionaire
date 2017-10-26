var mongoose  = require('mongoose');
var mongoosePaginate = require('mongoose-paginate');


var Schema    = new mongoose.Schema({
  user:{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  service: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Service"
  },
  status: String,
  subject: String,
  date: {type:Date, default: Date.now},
  message: [{
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
      },
    message: {
      type: String,
      required: true
    },
    date: {type:Date, default: Date.now}
  }]
});

Schema.plugin(mongoosePaginate);

module.exports  = mongoose.model('Ticket', Schema);
