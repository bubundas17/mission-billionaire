const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const sessionStore = new MongoStore({ mongooseConnection: mongoose.connection });
// MongoStore = MongoStore(express)
// console.log(mongoose.connection.config);
let config = {};
config.site = {
    protocol: "https://",
    siteUrl: "missionbillinoure.in"
};

// Session Configuration.
config.sessions = {
    secret: '%^&&%&#^%$^%&^*&(*^%$#kjhdsfkjhlfdshjkldgfshljkgfdjkhlgfdjkhl5264245626455264',
    cookie: {expires: new Date(253402300000000)},
    store: sessionStore,
    resave: false,
    saveUninitialized: false
};

// database configuration
config.database = {
    connect: "mongodb://localhost/tkc",
};

// Google RECaptcha Configuration.
config.recaptcha = {
    secret: "6Lcz3ikUAAAAAEruySQzyO2AvBjaPhSiWDSQtKnC",
    siteKey: "6Lcz3ikUAAAAAPWKCJorBvf8VvXjaDUUf2dBWkdC"
};

// BruteForce Module.
config.bruteforce = {
    freeRetries: 2000,
    minWait: 5 * 60 * 1000, // 5 minutes
    maxWait: 60 * 60 * 1000
};

// Payment Gateway Config
// No needed for mission billionaire project.
config.instaMojo = {
    apiKey: "key",
    authKey: "auth",
    sandbox: false
};

// Mailer Configurations
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
};

module.exports = config;
