var express       = require('express');
var router        = express.Router();
var ticketDB      = require('../../models/ticket');
var middlewares   = require('../../includs/middlewares');


/*
***********************************************************************************************************************
***********************************    Ticket Routs            ***********************************************
***********************************************************************************************************************
*/
var serviceActive     = "ACTIVE"
var serviceAnswered   = "ANSWERED"
var serviceClosed     = "CLOSED"

router.get('/', middlewares.ifLoggedIn, middlewares.ifAdmin, (req, res) => {
  ticketDB.find({
    status: serviceActive
  })
  .populate('service')
  .populate('message.user')
  .exec((err, active) => {
    if (err) {
      req.flash('error', 'Somthing Wents Wrong!')
      return res.redirect('back');
    }
    ticketDB.find({})
    .populate('service')
    .populate('message.user')
    .exec((err, tickets) => {
      if (err) {
        req.flash('error', 'Somthing Wents Wrong!')
        return res.redirect('back');
      }
      res.render('admin/tickets/index.ejs', {active: active, tickets: tickets})
    })
  })
})

router.get('/:id', middlewares.ifLoggedIn, middlewares.ifAdmin, (req, res) => {
  ticketDB.findById(req.params.id)
  .populate('service')
  .populate('message.user')
  .exec((err, ticket) => {
    if (err) {
      req.flash('error', 'Somthing Wents Wrong!')
      return res.redirect('back');
    }
    res.render('admin/tickets/view.ejs', {ticket: ticket})
  })
})

router.post('/:id', middlewares.ifLoggedIn, middlewares.ifAdmin, (req, res) => {
  ticketDB.findById(req.params.id)
  .populate('service')
  .populate('message.user')
  .exec((err, ticket) => {
    if (err) {
      req.flash('error', 'Somthing Wents Wrong!')
      return res.redirect('back');
    }
    ticket.status = serviceAnswered;
    ticket.message.push({
        message: req.body.message,
        user: req.user._id
      })
    ticket.save(arr => {
      if(err) {
        req.flash('error', 'Somthing is wents wrong. Please Contact To System Admin.')
        return res.redirect("back");
      }
    })
    req.flash('success', 'Submited!')
    return res.redirect("back");
  })
})


module.exports = router;
