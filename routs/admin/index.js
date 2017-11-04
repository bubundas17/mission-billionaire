// Imports
var express       = require('express');
var ticketsDB     = require('../../models/ticket');
var middlewares   = require('../../includs/middlewares');


// Routs
var ticketsRoutes = require('./tickets')
var rechargeRoutes = require('./recharge')
var usersRoutes = require('./users')
var token         = require('./token')
var widwrawls    = require('./widwral')


var router        = express.Router();

router.get("/", middlewares.ifLoggedIn, middlewares.ifAdmin, function(req, res){
  res.locals.title = 'Admin Area' + ' - ' + res.locals.title;
  res.render('admin/index.ejs')
});

router.use('/recharge', rechargeRoutes);
router.use('/tickets', ticketsRoutes);
router.use('/users', usersRoutes);
router.use('/token', token);
router.use('/widwrawl', widwrawls);

module.exports = router;
