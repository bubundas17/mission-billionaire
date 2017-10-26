// Imports
var express       = require('express');
var serviceDB     = require('../../models/services');
var ticketsDB     = require('../../models/ticket');
var middlewares   = require('../../includs/middlewares');


// Routs
var ticketsRoutes = require('./tickets')
var rechargeRoutes = require('./recharge')
var plansRoutes = require('./plans')
var servicesRoutes = require('./services')
var usersRoutes = require('./users')
var token         = require('./token')
var widwrawls    = require('./widwral')


var router        = express.Router();

router.get("/", middlewares.ifLoggedIn, middlewares.ifAdmin, function(req, res){
  res.locals.title = 'Admin Area' + ' - ' + res.locals.title;
  var info = {}
    Promise.all(
      [
        serviceDB.find({'service.status': 'PROCESSING'})
          .populate('user'),
        ticketsDB.find({ status: "ACTIVE"})
          .populate('user')
          .populate('service')
       ])
      .then( info => {
        // console.log(info);
        res.render('admin/index.ejs', { services: info[0], tickets: info[1]})
      })
      .catch( err => {
        req.flash('error', 'Somthing is wents wrong! Please contact to bubun.')
        res.redirect('/')
        console.log(err);
    })
});

router.use('/services', servicesRoutes);
router.use('/plans', plansRoutes);
router.use('/recharge', rechargeRoutes);
router.use('/tickets', ticketsRoutes);
router.use('/users', usersRoutes);
router.use('/token', token);
router.use('/widwrawl', widwrawls);

module.exports = router;
