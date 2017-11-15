const sha1 = require("crypto-js/sha1");
const md5 = require("crypto-js/md5");
const urlP = require('url');
const config = require('../config');

// Databases.
const userDB = require('../models/user');
const statementDB = require('../models/statement');
const ReferialincomeBD = require('../models/referialincome');

let func = {};
// Random Password Salt Generator
func.password = (password, salt) => {
    return sha1(sha1(password).toString() + md5(salt).toString()).toString();
};


func.doRefCredit = (userc) => {
    userc.upTree.forEach((user, index) => {
        let credit = 0;
        switch (index) {
            case 0:
                credit = 100;
                break;
            case 1:
                credit = 50;
                break;
            case 2:
                credit = 30;
                break;
            case 3:
                credit = 20;
                break;
            case 4:
                credit = 20;
                break;
            case 5:
                credit = 20;
                break;
            case 6:
                credit = 20;
                break;
            case 7:
                credit = 15;
                break;
            case 8:
                credit = 15;
                break;
            case 9:
                credit = 10;
                break;
            default:
                credit = 0;
                break;
        }
        userDB.findById(user)
            .then(us => {
                us.credits += credit;
                us.save();
                ReferialincomeBD.create({
                    user: us._id,
                    description: "Activation of a user on level " + (index + 1),
                    amount: credit
                })
            })
            .catch(e => {
                console.log(e);
            })
    });

    if (! userc.referedBy === userc.upTree[0]) {
        userDB.findById(userc.referedBy)
            .then(us => {
                us.credits += 100;
                us.save();
                ReferialincomeBD.create({
                    user: us._id,
                    description: "Activation of a user on level " + (index + 1),
                    amount: 100
                })
            })
            .catch(e => {
                console.log(e);
            })
    }
};

// Make Email Address Show Parthia.
func.hideEmail = email => {
    const parts = email.split("@");
    var name = parts[0];
    var result = name[2];
    for (var i = 1; i < name.length; i++) {
        result += "*";
    }
    result += name.charAt(name.length - 1);
    result += "@";
    var domain = parts[1];
    result += domain.charAt(0);
    var dot = domain.indexOf(".");
    for (var i = 1; i < dot; i++) {
        result += "*";
    }
    result += domain.substring(dot);

    return result;
};


// Hide Parts Of Email ID
func.censorEmail = function (email) {
    let arr = email.split("@");
    return this.censorWord(arr[0]) + "@" + this.censorWord(arr[1]);
};


// Generating Password Reset Link.
func.makeReset = (user, callback) => {
    userDB.findOne({username: user.toLowerCase()}, (err, userinfo) => {
        if (err) {
            callback(err, null);
        }
        let hash = sha1(sha1(userinfo.salt).toString() + md5(userinfo.username).toString() + md5(userinfo.credits).toString()).toString();
        callback(null, hash)
    })
};

// Set / Update password of a user.
func.setPassword = function (user, password, callback) {
    let salt = this.createSalt();
    let hash = this.password(password, salt);
    user.password = hash; // Storing Hashed password instead of actual password.
    user.salt = salt;
    user.save(function (err, user) {
        if (err) {
            callback(err, null);
        } else {
            callback(null, user);
        }
    })
};

// Setting Up Global Variable.
func.global = (req, res, next) => {
    var sess = req.session;
    res.locals.userInfo = false;
    res.locals.body = req.body;
    res.locals.func = func;
    res.locals.config = config;
    res.locals.query = req.query;
    res.locals.title = "Mission Billionaire";
    res.locals.md5 = md5;
    res.locals.req = req;
    res.locals.res = res;
    if (req.user) {
        res.locals.userInfo = req.user;
    }

    next()

};

// Check User's Password.
func.checkUser = (username, pwd, callback) => {
    var salt;
    username = username.toLowerCase();
    if (username && pwd) {
        userDB.findOne({$or: [{username: username}, {'meta.email': username}]}, function (err, user) {
            if (err) {
                console.log(err);
                callback(false);
            }
            if (user) {
                // if (user.username == username) {
                salt = user.salt;
                // } else {callback(false)}
                if (sha1(sha1(pwd).toString() + md5(salt).toString()).toString() === user.password) {
                    callback(sha1(sha1(pwd).toString() + md5(salt).toString()).toString());
                } else {
                    callback(false);
                }
            } else callback(false);
        })
    } else callback(false);
};
// Random salt Generator.
func.createSalt = () => {
    var length = 18,
        charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
        retVal = "";
    for (var i = 0, n = charset.length; i < length; ++i) {
        retVal += charset.charAt(Math.floor(Math.random() * n));
    }
    return retVal;
};
// Password and salting Checker and combiner

func.refName = req => {
    let reffUrl = req.header('Referer') + "";
    let reffDir = urlP.parse(reffUrl).pathname;
    let reffHost = urlP.parse(reffUrl).hostname;
    if (config.site.siteUrl === reffHost) {
        return reffDir.substring(1);
    } else {
        return false;
    }
};

func.makeTxn = (inuser, info, save, callback) => {
    let txnType = "";
    if (info.ammount < 0) {
        txnType = "DEBIT";
    } else {
        txnType = "CREDIT";
    }
    let txnID;
    let d = new Date();
    txnID = d.getUTCDate().toString();
    txnID += d.getUTCMonth().toString();
    txnID += d.getUTCFullYear().toString();
    txnID += d.getUTCHours().toString();
    txnID += d.getUTCHours().toString();
    txnID += d.getUTCMinutes().toString();
    txnID += d.getUTCMinutes().toString();
    txnID += d.getUTCSeconds().toString();
    txnID += d.getUTCMilliseconds().toString();
    statementDB.create({
        user: inuser,
        txnId: txnID,
        txnType: txnType,
        ammount: Math.abs(info.ammount),
        reason: info.reason,
        status: info.status || "SUCCEED",
    }, function (err, txn) {
        if (err) {
            callback(err, null); // Run Callback With Error
        } else {
            if (save) {
                userDB.findById(inuser, function (err1, userData) {
                    if (err1) {
                        callback(err1, null);
                    } else {
                        userData.credits += info.ammount;
                        userData.save(function (err2) {
                            if (err2) {
                                callback(err2, null);
                            } else {
                                callback(null, txn.txnId);
                            }
                        })
                    }
                })
            } else {
                callback(null, txn.txnId);
            }
        }
    })
};

func.getTxnId = date => {
    let id;
    let d = new Date(date);
    id = d.getUTCDate().toString();
    id += d.getUTCMonth().toString();
    id += d.getUTCFullYear().toString();
    id += d.getUTCHours().toString();
    id += d.getUTCHours().toString();
    id += d.getUTCMinutes().toString();
    id += d.getUTCMinutes().toString();
    id += d.getUTCSeconds().toString();
    id += d.getUTCMilliseconds().toString();
    return id;
};


func.formatDate = date => {
    let year = date.getFullYear();
    let month = date.getMonth() + 1;
    let dt = date.getDate();

    if (dt < 10) {
        dt = '0' + dt;
    }
    if (month < 10) {
        month = '0' + month;
    }

    return dt + '-' + month + '-' + year
};


func.timeDifference = (current, previous) => {

    let msPerMinute = 60 * 1000;
    let msPerHour = msPerMinute * 60;
    let msPerDay = msPerHour * 24;
    let msPerMonth = msPerDay * 30;
    let msPerYear = msPerDay * 365;

    let elapsed = current - previous;

    if (elapsed < msPerMinute) {
        return Math.round(elapsed / 1000) + ' seconds';
    }

    else if (elapsed < msPerHour) {
        return Math.round(elapsed / msPerMinute) + ' minutes';
    }

    else if (elapsed < msPerDay) {
        return Math.round(elapsed / msPerHour) + ' hours';
    }

    else if (elapsed < msPerMonth) {
        return 'approximately ' + Math.round(elapsed / msPerDay) + ' days';
    }

    else if (elapsed < msPerYear) {
        return 'approximately ' + Math.round(elapsed / msPerMonth) + ' months';
    }

    else {
        return 'approximately ' + Math.round(elapsed / msPerYear) + ' years';
    }
};

// This Function Takes user as arguments and return the referable user from the database.

func.getReferableUser = (user, callback) => {
    return new Promise((resolve, reject) => {
        if (user.totalReferred < 2) {
            // User Can add masers to his downstream.
            resolve(user);
            return callback(null, user);
        }

        return userDB.findOne({upTree: user._id, totalReferred: {$lt: 2}})
            .then((value) => {
                if (value) {
                    resolve(value);
                    return callback(null, value);
                }
                return userDB.findOne({totalReferred: {$lt: 2}})
            })
            .then((value) => {
                if (value) {
                    resolve(value);
                    return callback(null, value);
                }
            })
            .catch((err) => {
                reject(err);
                return callback(err, null);
            })
    })
};

func.toTitleCase = (str) => {
    return str.replace(/\w\S*/g, function (txt) {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
};
module.exports = func;
