const express = require('express');
const router = express.Router();
const ticketDB = require('../../models/ticket');
const middlewares = require('../../includs/middlewares');


/*
***********************************************************************************************************************
***********************************    Ticket Routs            ***********************************************
***********************************************************************************************************************
*/
const serviceActive = "ACTIVE";
const serviceAnswered = "ANSWERED";
const serviceClosed = "CLOSED";

router.get('/', middlewares.ifLoggedIn, middlewares.ifAdmin, (req, res) => {
    ticketDB.find({
        status: serviceActive
    })
        .populate('service')
        .populate('message.user')
        .exec((err, active) => {
            if (err) {
                req.flash('error', 'Something Wants Wrong!')
                return res.redirect('back');
            }
            ticketDB.find({})
                .populate('service')
                .populate('message.user')
                .exec((err, tickets) => {
                    if (err) {
                        req.flash('error', 'Something Wants Wrong!');
                        return res.redirect('back');
                    }
                    res.render('admin/tickets/index.ejs', {active: active, tickets: tickets})
                })
        })
});

router.get('/:id', middlewares.ifLoggedIn, middlewares.ifAdmin, (req, res) => {
    ticketDB.findById(req.params.id)
        .populate('service')
        .populate('message.user')
        .exec((err, ticket) => {
            if (err) {
                req.flash('error', 'Something Wants Wrong!');
                return res.redirect('back');
            }
            res.render('admin/tickets/view.ejs', {ticket: ticket})
        })
});

router.post('/:id', middlewares.ifLoggedIn, middlewares.ifAdmin, (req, res) => {
    ticketDB.findById(req.params.id)
        .populate('service')
        .populate('message.user')
        .exec((err, ticket) => {
            if (err) {
                req.flash('error', 'Something Wants Wrong!');
                return res.redirect('back');
            }
            ticket.status = serviceAnswered;
            ticket.message.push({
                message: req.body.message,
                user: req.user._id
            })
            ticket.save(arr => {
                if (err) {
                    req.flash('error', 'Something is wants wrong. Please Contact To System Admin.');
                    return res.redirect("back");
                }
            })
            req.flash('success', 'Submitted!');
            return res.redirect("back");
        })
});


module.exports = router;
