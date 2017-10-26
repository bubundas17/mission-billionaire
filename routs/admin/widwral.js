var express       = require('express');
var router        = express.Router();
var userDB        = require('../../models/user');
var middlewares   = require('../../includs/middlewares');
var func          = require('../../includs/func')
var sysinfoDB     = require('../../models/sysinfo')
var widwrawlDB    = require('../../models/withdrawal')
var rechargeDB    = require('../../models/recharge')



router.get('/', middlewares.ifLoggedIn, middlewares.ifAdmin, (req, res) => {
  Promise.all([
    sysinfoDB.findOne({ name: "Tkc4you" }),
    widwrawlDB.find({status: 'PROCESSING'}),
    rechargeDB.find({status: 'PROCESSING'})
  ])
    .then( all => {
      res.render('admin/widwrawl/index.ejs', {info: all[0], widwrawls: all[1], recharges: all[2]})
    })
    .catch( err => {
      console.log('Database Error');
      console.log(err);
      req.flash('error', 'Database Read Error')
      res.redirect('back')
    })
})

router.get('/config', middlewares.ifLoggedIn, middlewares.ifAdmin, (req, res) => {
    sysinfoDB.findOne({ name: "Tkc4you" })
    .then( all => {
      res.render('admin/widwrawl/config.ejs', {info: all})
    })
    .catch( err => {
      console.log('Database Error');
      console.log(err);
      req.flash('error', 'Database Read Error')
      res.redirect('back')
    })
})

router.post('/config', middlewares.ifLoggedIn, middlewares.ifAdmin, (req, res) => {
    let rates   =   req.body.rates;
    rates       =   parseFloat(rates)

    sysinfoDB.findOne({ name: "Tkc4you" })
    .then( all => {
        all.tkcRates = rates;
        all.save()
        req.flash('success', 'Saved!')
        res.redirect('back')
    })
    .catch( err => {
      console.log('Database Error');
      console.log(err);
      req.flash('error', 'Database Read Error')
      res.redirect('back')
    })
})


router.get('/all', middlewares.ifLoggedIn, middlewares.ifAdmin, (req, res) => {
  Promise.all([
    sysinfoDB.findOne({ name: "Tkc4you" }),
    widwrawlDB.find().populate('user'),
    rechargeDB.find().populate('user')
  ])
    .then( all => {
      res.render('admin/widwrawl/requests.ejs', {info: all[0], widwrawls: all[1], recharges: all[2]})
    })
    .catch( err => {
      console.log('Database Error');
      console.log(err);
      req.flash('error', 'Database Read Error')
      res.redirect('back')
    })
})

router.get('/tkc/:id',  middlewares.ifLoggedIn, middlewares.ifAdmin, (req, res) => {
  widwrawlDB.findById(req.params.id)
    .populate('user')
    .then( info => {
      res.render('admin/widwrawl/viewwid.ejs', {info})
    })
    .catch( err => {
      console.log('Database Error');
      console.log(err);
      req.flash('error', 'Database Read Error')
      res.redirect('back')
    })
})

router.post('/tkc/:id',  middlewares.ifLoggedIn, middlewares.ifAdmin, (req, res) => {
  var remarks = req.body.remarks
  var status  = req.body.status
  widwrawlDB.findById(req.params.id)
    .then( info => {
      info.status = status;
      info.remarks = remarks;
      info.save()
      req.flash('success', 'Request Completed!')
      res.redirect('back')
    })
    .catch( err => {
      console.log('Database Error');
      console.log(err);
      req.flash('error', 'Database Read Error')
      res.redirect('back')
    })
})


router.get('/recharge/:id', middlewares.ifLoggedIn, middlewares.ifAdmin, (req, res) => {
  rechargeDB.findById(req.params.id)
    .populate('user')
    .then( info => {
      res.render('admin/widwrawl/viewrech.ejs', {info})
    })
    .catch( err => {
      console.log('Database Error');
      console.log(err);
      req.flash('error', 'Database Read Error')
      res.redirect('back')
    })
})

router.post('/recharge/:id', middlewares.ifLoggedIn, middlewares.ifAdmin, (req, res) => {
  var remarks = req.body.remarks
  var status  = req.body.status
  rechargeDB.findById(req.params.id)
    .then( info => {
      info.status = status;
      info.remarks = remarks;
      info.save()
      req.flash('success', 'Request Completed!')
      res.redirect('back')
    })
    .catch( err => {
      console.log('Database Error');
      console.log(err);
      req.flash('error', 'Database Read Error')
      res.redirect('back')
    })
})
module.exports = router
