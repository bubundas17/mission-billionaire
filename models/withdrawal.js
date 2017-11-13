const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');

const Schema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    amount: {type: Number},
    tkcaddress: {type: String},
    status: {type: String, default: "PROCESSING"}, // PROCESSING, SUCCEED and FAILED
    description: {type: String}, // message for admin from user
    remarks: {type: String}, // message for user about request details.
    date: {type: Date, default: Date.now}
});


Schema.plugin(mongoosePaginate);
module.exports = mongoose.model('Withdrawal', Schema);
