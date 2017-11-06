var express     = require('express');
var mongoose    = require('mongoose');
var MongoStore  = require('connect-mongo');

// MongoStore = MongoStore(express)

var config    = {};
config.site   = {
  protocol: "https://",
  siteUrl: "missionbillinoure.in"
}
// Session Configration.
  config.sessions   = {
    secret: '%^&&%&#^%$^%&^*&(*^%$#kjhdsfkjhlfdshjkldgfshljkgfdjkhlgfdjkhl5264245626455264',
    cookie: {expires: new Date(253402300000000)},
    // store: new MongoStore({ mongooseConnection: mongoose.connection }),
    resave: false,
    saveUninitialized: false
  }

// database configration
config.database = {
  connect:"mongodb://localhost/tkc",
}

// Google recaptcha Configration.
config.recaptcha = {
  secret: "6Lcz3ikUAAAAAEruySQzyO2AvBjaPhSiWDSQtKnC"
}

// BruteForce Module.
config.bruteforce = {
  freeRetries: 2000,
  minWait: 5*60*1000, // 5 minutes
  maxWait: 60*60*1000
}

// Payment Gateway Config
config.instaMojo = {
  apiKey: "key",
  authKey: "auth",
  sandbox: false
}

// Mailer Configration
config.mailer = {
    host: 'mail.atozserver.com',
    port: 465,
    secure: true, // secure:true for port 465, secure:false for port 587
    auth: {
        user: 'noreply@tkc4you.com',
        pass: 'RJaTse5r'
    },
    tls: {
       // do not fail on invalid certs
       rejectUnauthorized: false
   }
}

module.exports = config;
