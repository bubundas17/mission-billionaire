const express = require('express');
const router = express.Router();
const middlewares = require('../../includs/middlewares');
const userDB = require('../../models/user');
const func = require('../../includs/func');

/*
***********************************************************************************************************************
***********************************        Recharge Routs            **************************************************
***********************************************************************************************************************
*/

// Recharge A user
router.get('/', middlewares.ifLoggedIn, middlewares.ifAdmin, function (req, res) {
    userDB.find({}, function (err, user) {
        if (err) {
            req.flash('error', 'Somthing Is Wents Wrong!')
            res.redirect('back');
        } else {
            res.locals.title = 'Recharge User' + ' - ' + res.locals.title;
            res.render('admin/recharge.ejs', {users: user});
        }
    })
});

// Submit and verify data and recharge.
router.post('/', middlewares.ifLoggedIn, middlewares.ifAdmin, function (req, res) {
    userDB.findById(req.body.user, function (err, user) {
        func.makeTxn(user, {
            ammount: parseInt(req.body.ammount),
            reason: req.body.reason,
            status: "SUCCEED",
        }, true, function (err, txnId) {
            if (err) {
                req.flash('error', "Somthing Is Wents Wrong!");
                res.redirect('back')
            } else {
                req.flash('success', "Recharge Done!")
                res.redirect('back')
            }
        })
    })

});


/*
***********************************************************************************************************************
***********************************    End of Recharge Routs            ***********************************************
***********************************************************************************************************************
*/

module.exports = router;
