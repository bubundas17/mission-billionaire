const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');

const Schema = new mongoose.Schema({
    code: {type: String, required: true, unique: true},
    isUsed: {type: Boolean, default: false},
    user: {type: mongoose.Schema.Types.ObjectId, ref: "User"},
    date: {type: Date, default: Date.now}
});

Schema.plugin(mongoosePaginate);
module.exports = mongoose.model('Token', Schema);
