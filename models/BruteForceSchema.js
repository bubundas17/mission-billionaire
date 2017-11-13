var mongoose = require('mongoose');

var Schema = new mongoose.Schema({
    "_id": String,
    "data": {
        "count": Number,
        "lastRequest": Date,
        "firstRequest": Date
    },
    "expires": Date
});

module.exports = mongoose.model('BruteStore', Schema);
