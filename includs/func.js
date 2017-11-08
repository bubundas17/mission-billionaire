var sha1              = require("crypto-js/sha1");
var md5               = require("crypto-js/md5");
var urlP              = require('url');
var config            = require('../config')

// Databases.
var userDB            = require('../models/user')
var statementDB       = require('../models/statement')
var ReferialincomeBD  = require('../models/referialincome')
var sysinfoDB         = require('../models/sysinfo')
var nonworkingIncomeDB  = require('../models/nonworkingincome')
var GoldDB              = require('../models/goldIncmone')
var PlatunumDB          = require('../models/platinumIncome')
var DimondDB            = require('../models/dimondIncome')

var func = {}
// Random Password Salt Generator
func.password  = function(password, salt){
  return sha1(sha1(password).toString() + md5(salt).toString()).toString();
}

// Make Email Address Show Parthialy.
func.hideEmail = function(email) {
    var parts = email.split("@");
    var name = parts[0];
    var result = name[2];
    for(var i=1; i<name.length; i++) {
        result += "*";
    }
    result += name.charAt(name.length - 1);
    result += "@";
    var domain = parts[1];
    result += domain.charAt(0);
    var dot = domain.indexOf(".");
    for(var i=1; i<dot; i++) {
        result += "*";
    }
    result += domain.substring(dot);

    return result;
}


// Hide Parts Of Email ID
func.censorEmail = function (email){
     var arr = email.split("@");
     return this.censorWord(arr[0]) + "@" + this.censorWord(arr[1]);
}


// Generating Password Reset Link.
func.makeReset  = function(user, callback){
  userDB.findOne({username: user.toLowerCase()}, function(err, userinfo){
    if (err) {
      callback(err, null);
    }
    var hash = sha1(sha1(userinfo.salt).toString() + md5(userinfo.username).toString() + md5(userinfo.credits).toString()).toString();
    callback(null, hash)
  })
}

// Set / Update password of a user.
func.setPassword = function(user, password, callback){
  var salt     = this.createSalt();
  var hash     = this.password(password, salt);
  user.password = hash; // Storing Hashed password instead of actual password.
  user.salt = salt;
  user.save(function(err, user){
    if (err) {
      callback(err, null);
    } else {
      callback(null, user);
    }
  })
}

// Setting Up Global Veriabls.
func.global = function(req, res, next){
  var sess  = req.session;
  res.locals.userInfo = false;
  res.locals.body = req.body;
  res.locals.func = func;
  res.locals.config = config;
  res.locals.query = req.query;
  res.locals.title = "Mission Billinoure";
  res.locals.md5 = md5;
  res.locals.req = req;
  res.locals.res = res;
  if (req.user) {
    res.locals.userInfo = req.user;
  }

  next()

}

// Check User's Password.
func.checkUser = function(username, pwd, callback){
  var salt;
  username = username.toLowerCase();
  if (username && pwd) {
    userDB.findOne({$or: [{username: username}, {'meta.email': username}]}, function(err, user){
      if (err) {
        console.log(err);
        callback(false);
      }
      if (user) {
        // if (user.username == username) {
          salt = user.salt;
        // } else {callback(false)}
        if( sha1(sha1(pwd).toString() + md5(salt).toString()).toString() == user.password){
           callback(sha1(sha1(pwd).toString() + md5(salt).toString()).toString());
        } else { callback(false);}
      } else callback(false);
    })
  } else callback(false);
}
// Random salt Generator.
func.createSalt = function(){
  var length = 18,
      charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
      retVal = "";
  for (var i = 0, n = charset.length; i < length; ++i) {
      retVal += charset.charAt(Math.floor(Math.random() * n));
  }
  return retVal;
}
// Password and salting Checker and combiner

func.refName = function(req) {
  var reffUrl = req.header('Referer') + "";
  var reffDir = urlP.parse(reffUrl).pathname;
  var reffHost = urlP.parse(reffUrl).hostname;
  if (config.site.siteUrl == reffHost) {
    return  reffDir.substring(1);
  } else {
    return false;
  }
}

func.makeTxn  = function(inuser, info, save, callback ){
  var txnType = "";
  if (info.ammount < 0 ) {
    txnType = "DEBIT";
  } else {
    txnType = "CREDIT";
  }
  var txnID;
  var d = new Date();
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
    status: info.status  || "SUCCEED",
  }, function(err, txn){
    if (err) {
      callback(err, null); // Run Callback With Error
    } else {
      if (save) {
        userDB.findById(inuser, function(err1, userData){
          if (err1) {
            callback(err1, null);
          } else {
            userData.credits += info.ammount;
            userData.save(function(err2){
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
}

func.getTxnId = function(date){
  var id;
  var d = new Date(date);
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


func.formatDate = (date) => {
  year = date.getFullYear();
  month = date.getMonth()+1;
  dt = date.getDate();

  if (dt < 10) {
    dt = '0' + dt;
  }
  if (month < 10) {
    month = '0' + month;
  }

  return dt+'-' + month + '-'+year
}




func.timeDifference = (current, previous) => {

    var msPerMinute = 60 * 1000;
    var msPerHour = msPerMinute * 60;
    var msPerDay = msPerHour * 24;
    var msPerMonth = msPerDay * 30;
    var msPerYear = msPerDay * 365;

    var elapsed = current - previous;

    if (elapsed < msPerMinute) {
         return Math.round(elapsed/1000) + ' seconds';
    }

    else if (elapsed < msPerHour) {
         return Math.round(elapsed/msPerMinute) + ' minutes';
    }

    else if (elapsed < msPerDay ) {
         return Math.round(elapsed/msPerHour ) + ' hours';
    }

    else if (elapsed < msPerMonth) {
         return 'approximately ' + Math.round(elapsed/msPerDay) + ' days';
    }

    else if (elapsed < msPerYear) {
         return 'approximately ' + Math.round(elapsed/msPerMonth) + ' months';
    }

    else {
         return 'approximately ' + Math.round(elapsed/msPerYear ) + ' years';
    }
}


func.getReferableUser = (user, callback) => {
  return new Promise((resolve, reject) => {
    if (user.totalReferred <= 2) {
      // User Can add musers to his downstreem.
      resolve(user);
      return callback(null, user);
    }

    return userDB.findOne({upTree: user._id, totalReferred: {$lt: 2}})
      .then((value) => {
        if (value) {
          resolve(value)
          return callback(null, value);
        }
        return userDB.findOne({totalReferred: {$lt: 2}})
      })
      .then((value) => {
        if (value) {
          resolve(value)
          return callback(null, value);
        }
      })
      .catch((err) => {
        reject(err)
        return callback(err, null);
      })
  })
}
module.exports  = func;
