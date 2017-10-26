var servicesDB = require('../models/services');
var BruteForceDB = require('../models/BruteForceSchema.js');
var request = require('request');
var ExpressBrute = require('express-brute');
var MongooseStore = require('express-brute-mongoose');

var config = require('../config');

// Configuring
var BruteForceStore = new MongooseStore(BruteForceDB);
var bruteforce = new ExpressBrute(BruteForceStore, config.bruteforce);



var fun = require('./func');
var func = {}

func.ifActive = (req, res, next) => {
  if (req.user.isActive) {
    return next()
  }
  req.flash('info', 'Please Activate your account.')
  res.redirect('/clientarea/active')
}

func.ifNotActive = (req, res, next) => {
  if (req.user.isActive) {
    req.flash('info', 'Your account is Already Active!.')
    return res.redirect('/clientarea/active')

  }
  next()
}

func.ifNotLoggedIn = function(req, res, next) {
  if (!req.user) {
    next();
  } else {
    req.flash('info', 'No Need. You Are Already Logged In!!!')
    res.redirect('back');
  }
}

func.ifLoggedIn = function(req, res, next) {
  var reff = fun.refName(req);
  if (req.user) {
    next();
  } else {
    req.flash('error', 'You Need To Login Or Signup First.');
    if (reff) {
      res.redirect('/login?ref=' + reff);
    } else {
      res.redirect('/login');
    }
  }
}

func.hasService = function(req, res, next) {
  servicesDB.findById(req.params.id, function(err, ok) {
    if (err) {
      req.flash('error', 'Somthing Is Wents Wrong!');
      res.redirect('back');
    } else if (ok.user == req.user._id) {
      next();
    } else {
      req.flash('error', 'You are not allowed to do so.');
      res.redirect('back');
    }
  })
}


func.ifAdmin = function(req, res, next) {
  if (req.user.isAdmin == true) {
    next();
  } else {
    req.flash('error', 'You Are Not Authorised To Do So.');
    res.redirect('back');
  }
}

func.bruteForcePrevent = bruteforce.prevent;

func.checkCaptha = function(req, res, next) {
  request.post({
    url: 'https://www.google.com/recaptcha/api/siteverify',
    form: {
      response: req.body['g-recaptcha-response'],
      secret: config.recaptcha.secret
    }
  }, function(err, response, body) {
    if (err) {
      req.flash('error', 'Please Fill The Captha Properly.');
      return;
    }
    var json = JSON.parse(body);
    if (json.success) {
      next();
    } else {
      req.flash('error', 'Please Fill The Captha Properly.');
      res.redirect('back');
    }
  });
}

module.exports = func;
