var express = require('express');
var router = express.Router();
var func = require('../includs/func');

// Authentication Routs
var authRouts = require('./auth');
var clientareaRouts = require('./clientarea');
var adminRouts = require('./clientarea');
var adminRouts = require('./admin');
var profileRouts = require('./profile');
var footerRoutes = require('./footer');

// Landing Page
router.get('/', function (req, res) {
    res.render('index.ejs');
});

// initlizetion of routs
router.use(authRouts);
router.use(footerRoutes);
router.use('/clientarea', clientareaRouts);
router.use('/admin', adminRouts);
// router.use('/products', productsRouts);
router.use('/profile', profileRouts);

module.exports = router;
