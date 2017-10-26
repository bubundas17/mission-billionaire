var express       = require('express');
var router        = express.Router();
var middlewares   = require('../../includs/middlewares');
var userDB        = require('../../models/user');
var func          = require('../../includs/func');
var productDB     = require('../../models/product');



/*
***********************************************************************************************************************
**********************************               Plan Routs              **********************************************
***********************************************************************************************************************
*/

// View All Plans
router.get("/", middlewares.ifLoggedIn, middlewares.ifAdmin, function(req, res){
  productDB.find({})
    .sort({order: 1})
    .then(function(plans){
      res.locals.title = 'View Plans' + ' - ' + res.locals.title;
      res.render('admin/plans.ejs', {plans: plans});
  })
  .catch( err => {
    req.flash('error', 'Somthing Is Wents Wrong!')
    res.redirect('back');
  })
});

// Create a new plan
router.get("/new", middlewares.ifLoggedIn, middlewares.ifAdmin, function(req, res){
  res.locals.title = 'View Plans' + ' - ' + res.locals.title;
  res.render('admin/newplan.ejs');
});


// Submit New Plan
router.post("/", middlewares.ifLoggedIn, middlewares.ifAdmin, function(req, res){
  productDB.create({
    packName: req.body.packName,
    diskQuota: req.body.diskQuota,
    bandwidth: req.body.bandwidth,
    maxDomains: parseInt(req.body.maxDomains),
    price: parseInt(req.body.price),
    ssl: req.body.ssl,
    ffmpeg: req.body.ffmpeg,
    fileHosting: req.body.fileHosting,
    description: req.body.description
  }, function(err, ok){
    if (err) {
      req.flash('error', 'Somthing Is Wents Wrong!')
      res.redirect('back');
    } else {
      req.flash('success', 'Plan Has Been Added!')
      res.redirect('back');
    }
  })
});

// Edit a exlisting plan.
router.put("/:id", middlewares.ifLoggedIn, middlewares.ifAdmin, function(req, res){
  productDB.findById(req.params.id, function(err, ok){
    ok.packName =  req.body.packName,
    ok.diskQuota = req.body.diskQuota,
    ok.order = req.body.order,
    ok.thumbnail = req.body.thumbnail,
    ok.bandwisortdth  = req.body.bandwidth,
    ok.maxDomains = parseInt(req.body.maxDomains),
    ok.price = parseInt(req.body.price),
    ok.ssl = req.body.ssl,
    ok.ffmpeg = req.body.ffmpeg,
    ok.fileHosting = req.body.fileHosting,
    ok.description = req.body.description
    ok.save(function(err){
      if (err) {
        req.flash('error', 'Somthing Is Wents Wrong!')
        res.redirect('back');
      } else {
        req.flash('success', 'Saved!')
        res.redirect('back');
      }
    })
  })
});

// Previrw A Particular plan
router.get("/:id", middlewares.ifLoggedIn, middlewares.ifAdmin, function(req, res){
  productDB.findById(req.params.id, function(err, plan){
    if (err) {
      req.flash('error', 'Somthing Is Wents Wrong!')
      res.redirect('back');
    } else {
      res.locals.title = 'Edit Plan' + ' - ' + res.locals.title;
      res.render('admin/viewplan.ejs', {plan: plan});
    }
  })
});


// Turminate a plan
router.delete("/:id", middlewares.ifLoggedIn, middlewares.ifAdmin, function(req, res){
  productDB.findByIdAndRemove(req.params.id, function(err){
    if (err) {
      req.flash('error', 'Somthing Is Wents Wrong!')
      res.redirect('back');
    } else {
      req.flash('success', 'Plan Has Been Deleted!')
      res.redirect('back');
    }
  })
});

// Edit a Plan
router.get("/:id/edit", middlewares.ifLoggedIn, middlewares.ifAdmin, function(req, res){
  productDB.findById(req.params.id, function(err, plan){
    if (err) {
      req.flash('error', 'Somthing Is Wents Wrong!')
      res.redirect('back');
    } else {
      res.locals.title = 'Edit Plan' + ' - ' + res.locals.title;
      res.render('admin/editplan.ejs', {plan: plan});
    }
  })

});


/*
***********************************************************************************************************************
**********************************        End Of Plan Routs              **********************************************
***********************************************************************************************************************
*/

module.exports = router;
