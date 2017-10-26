var express       = require('express');
var router        = express.Router();
var middlewares   = require('../../includs/middlewares');
var serviceDB     = require('../../models/services');
var userDB        = require('../../models/user');
var func          = require('../../includs/func')




// View All Service Route
router.get("/", middlewares.ifLoggedIn, middlewares.ifAdmin, function(req, res){
  res.locals.title = 'Service List' + ' - ' + res.locals.title;
  var query = req.query.q || ".*"
  serviceDB.paginate({ $or: [
    {
      "service.domain": { "$regex": query + "", "$options": "i" }
    }, {
      'service.username': { "$regex": query + "", "$options": "i" }
    }
  ]
  },{
     page: req.query.page || 1,
     limit: 10,
     populate: 'user'
  })
  .then(function(services){
      res.locals.title = 'View Plans' + ' - ' + res.locals.title;
      res.render('admin/services.ejs', {services: services});
  })
  .catch( (err) => {
    req.flash('error', 'Somthing Is Wents Wrong!')
    console.log(err);
    res.redirect('back');
  })
});

// View a particular service
router.get("/:id", middlewares.ifLoggedIn, middlewares.ifAdmin, function(req, res){
  res.locals.title = 'Edit Service' + ' - ' + res.locals.title;
  serviceDB.findById(req.params.id).populate('user').exec(function(err, services){
    if (err) {
      req.flash('error', 'Somthing Is Wents Wrong!')
      res.redirect('back');
    } else {
      res.locals.title = 'View Plans' + ' - ' + res.locals.title;
      res.render('admin/viewservice.ejs', {services: services});
    }
  })
});

// Edit a service
router.get("/:id/edit", middlewares.ifLoggedIn, middlewares.ifAdmin, function(req, res){
  serviceDB.findById(req.params.id).populate('user').exec(function(err, services){
    if (err) {
      req.flash('error', 'Somthing Is Wents Wrong!')
      res.redirect('back');
    } else {
      res.locals.title = 'Edit Service' + ' - ' + res.locals.title;
      res.render('admin/editservice.ejs', {services: services});
    }
  })
});

// Active a service
router.get("/:id/active", middlewares.ifLoggedIn, middlewares.ifAdmin, function(req, res){
  res.locals.title = 'Active Service' + ' - ' + res.locals.title;
  serviceDB.findById(req.params.id).populate('user').exec(function(err, services){
    if (err) {
      req.flash('error', 'Somthing Is Wents Wrong!')
      res.redirect('back');
    } else {
      res.render('admin/activeService.ejs', {services: services});
    }
  })
});

// Submit Edited Data
router.put("/:id/active", middlewares.ifLoggedIn, middlewares.ifAdmin, function(req, res){
  serviceDB.findById(req.params.id).populate('user').exec(function(err, service){
    service.service.username         = req.body.username;
    service.service.package          = req.body.package;
    service.service.domain           = req.body.domain;
    service.service.panelUrl         = req.body.panelUrl;
    service.service.status           = req.body.status;
    service.service.renewalCost      = parseInt(req.body.renewalCost);
    service.service.renewsIn         = parseInt(req.body.renewsIn);
    service.service.lastRenewed      = new Date();
    service.service.nextRenewal      = new Date();
    service.service.info             = req.body.info;
    service.service.nextRenewal.setDate(service.service.nextRenewal.getDate() + service.service.renewsIn);
    service.save(function(err){
      if (err) {
        req.flash('error', 'Somthing Is Wents Wrong! Contact Bubun.')
        res.redirect('back');
      } else {
        req.flash('success', 'Service Has Been Activated!')
        res.redirect('back');
      }
    })
  })
});

router.put("/:id", middlewares.ifLoggedIn, middlewares.ifAdmin, function(req, res){
  serviceDB.findById(req.params.id).populate('user').exec(function(err, service){
    service.service.username         = req.body.username;
    service.service.package          = req.body.package;
    service.service.domain           = req.body.domain;
    service.service.panelUrl         = req.body.panelUrl;
    service.service.status           = req.body.status;
    service.service.renewalCost      = parseInt(req.body.renewalCost);
    service.service.renewsIn         = parseInt(req.body.renewsIn);
    service.service.info             = req.body.info;
    service.save(function(err){
      if (err) {
        req.flash('error', 'Somthing Is Wents Wrong!')
        res.redirect('back');
      } else {
        req.flash('success', 'Service Has Been Edited!')
        res.redirect('back');
      }
    })
  })
});

// Turminate a service.
router.delete("/:id", middlewares.ifLoggedIn, middlewares.ifAdmin, function(req, res){
  res.locals.title = 'Edit Service' + ' - ' + res.locals.title;
  serviceDB.findByIdAndRemove(req.params.id, function(err){
    if (err) {
      req.flash('error', 'Somthing Is Wents Wrong!')
      res.redirect('back');
    } else {
      req.flash('success', 'Service Has Been Deleted!')
      res.redirect('/admin/services');
    }
  })
});

/*
***********************************************************************************************************************
**********************************          End Of  Services Routs       **********************************************
***********************************************************************************************************************
*/
module.exports = router;
