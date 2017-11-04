const express       = require('express');
const middlewares   = require('../../includs/middlewares');
const func          = require('../../includs/func');
var   router        = express.Router();
const json          = require('json-parser');
const config        = require('../../config.js')


// Route Specific Imports
const ticketDB      = require('../../models/ticket.js') 

var serviceActive = "ACTIVE"
var serviceAnswered = "ANSWERED"
var serviceClosed = "CLOSED"

router.get("/", middlewares.ifLoggedIn, middlewares.ifActive, (req, res) => {
  res.locals.title = 'View Tickets' + " - " + res.locals.title;
  ticketDB.find({
      user: req.user._id
    })
    .populate('service')
    .exec(function(err, found) {
      if (err) {
        req.flash('error', 'Somthing is wents wrong. Please Contact To System Admin.')
        res.redirect("back");
      } else {
        res.render('tickets/index.ejs', {
          tickets: found
        });
      }
    })
})



router.get("/new", middlewares.ifLoggedIn, middlewares.ifActive, (req, res) => {
  res.locals.title = 'New Support Ticket' + " - " + res.locals.title;
  serviceDB.find({
    user: req.user._id
  }, function(err, found) {
    if (err) {
      req.flash('error', 'Somthing is wents wrong. Please Contact To System Admin.')
      res.redirect("back");
    } else {
      res.render('tickets/newTicket.ejs', {
        services: found
      });
    }
  })
})


router.get("/:id", middlewares.ifLoggedIn, middlewares.ifActive, (req, res) => {
  res.locals.title = 'View Tickets' + " - " + res.locals.title;
  ticketDB.findById(req.params.id)
    .populate('service')
    .populate('message.user')
    .exec(function(err, found) {
      if (found.user.toString() != req.user._id.toString()) {
        req.flash('error', 'Somthing is wents wrong. Please Contact To System Admin.')
        return res.redirect("back");
      }
      if (err) {
        req.flash('error', 'Somthing is wents wrong. Please Contact To System Admin.')
        res.redirect("back");
      } else {
        res.render('tickets/view.ejs', {
          ticket: found
        });
      }
    })
})

router.post("/:id", middlewares.ifLoggedIn, middlewares.ifActive, (req, res) => {
  res.locals.title = 'View Tickets' + " - " + res.locals.title;
  ticketDB.findById(req.params.id)
    .populate('service')
    .populate('message.user')
    .exec(function(err, found) {
      if (found.user.toString() != req.user._id.toString()) {
        req.flash('error', 'Somthing is wents wrong. Please Contact To System Admin.')
        return res.redirect("back");
      }
      if (err) {
        req.flash('error', 'Somthing is wents wrong. Please Contact To System Admin.')
        res.redirect("back");
      }
      found.message.push({
        message: req.body.message,
        user: req.user._id
      })
      found.save(arr => {
        if (err) {
          req.flash('error', 'Somthing is wents wrong. Please Contact To System Admin.')
          return res.redirect("back");
        }
      })
      req.flash('success', 'Submited!')
      return res.redirect("back");
    })
})


router.post("/", middlewares.ifLoggedIn,  middlewares.ifActive,  (req, res) => {
  var subject = req.body.subject
  var message = req.body.msg
  if (subject && message) {
    ticketDB.create({
      user: req.user._id,
      status: "ACTIVE",
      subject: subject,
      message: [{
        user: req.user,
        message: message
      }]
    }, (err, ok) => {
      if (err) {
        console.log(err);
        req.flash('error', 'Somthing Is Wents Wrong In Processing Your Request. Please retry.')
        return res.redirect('back')
      }
      req.flash('success', 'Your Ticket has been submited. One of our executives will reply you soon.')
      res.redirect('back');
    })
  }
})



module.exports = router;
