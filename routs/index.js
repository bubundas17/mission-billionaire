var express = require('express');
var router  = express.Router();
var func    = require('../includs/func');
var productDB  = require('../models/product');

// Authentication Routs
var authRouts		      = require('./auth');
var clientareaRouts		= require('./clientarea');
var adminRouts		    = require('./clientarea');
var adminRouts        = require('./admin');
var productsRouts     = require('./products');
var profileRouts      = require('./profile');
var footerRoutes      = require('./footer');

// Landing Page
router.get('/', function(req, res){
  productDB.find({})
  .sort({ order: 1 })
  .then(function(plans){
      res.render('index.ejs', {plans: plans});
  })
  .catch( err => {
    return console.log(err);
    res.render('index.ejs');
  })
});

// initlizetion of routs
router.use(authRouts);
router.use(footerRoutes);
router.use('/clientarea', clientareaRouts);
router.use('/admin', adminRouts);
// router.use('/products', productsRouts);
router.use('/profile', profileRouts);

module.exports = router;
