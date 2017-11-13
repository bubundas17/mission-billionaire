const mongoose = require('mongoose');
const Schema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    txnId: Number,
    txnType: String,
    ammount: Number,
    reason: String,
    status: String,
    date: {type: Date, default: Date.now}
});

module.exports  = mongoose.model('Invoice', Schema);
