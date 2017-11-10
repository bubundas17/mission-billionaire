const mongoose = require('mongoose');

const Schema = new mongoose.Schema({
    name: {type: String, required: true, unique: true},
    totalWidrawal: {type: Number, default: 1},
    dailyIncome: {type: Number, default: 0},
    tkcRates: {type: Number, default: 1.5}
});

module.exports  =   mongoose.model('Sysinfo', Schema);
