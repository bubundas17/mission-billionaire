const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');

const Schema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    amount: {type: Number},
    date: {type: Date, default: Date.now}
});


Schema.plugin(mongoosePaginate);
module.exports  =   mongoose.model('PlatinumIncome', Schema);
