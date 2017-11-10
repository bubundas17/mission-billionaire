const express = require('express');
const router = express.Router();
const middlewares = require('../includs/middlewares');
const func = require('../includs/func');
const ejs = require('ejs');
const mailer = require('../includs/mailer');

router.get('/', middlewares.ifLoggedIn, function (req, res) {
    res.render('profile/index.ejs', {user: req.user});
});

router.get('/edit', middlewares.ifLoggedIn, function (req, res) {
    res.render('profile/edit.ejs', {user: req.user});
});

router.put('/edit', middlewares.ifLoggedIn, function (req, res) {
    req.user.meta.phone = req.body.phone;
    req.user.meta.dateOfBarth = req.body.dateOfBarth;
    req.user.meta.address.country = req.body.country;
    req.user.meta.address.state = req.body.state;
    req.user.tkc = req.body.tkc;
    req.user.save(function (err) {
        if (err) {
            req.flash('error', 'Upps! Somthing Wents Wrong. Please Cotact To Administrator')
            res.redirect('/profile');
        } else {
            req.flash('success', 'Saved')
            res.redirect('/profile');
        }
    })

});


router.get('/chengepass', middlewares.ifLoggedIn, (req, res) => {
    res.render('profile/chengepass.ejs')
});

router.post('/chengepass', middlewares.ifLoggedIn, (req, res) => {
    var oldpassword = req.body.oldpass
    var newPass = req.body.newpass

    func.checkUser(req.user.username, oldpassword, pass => {
        if (pass) {
            func.setPassword(req.user, newPass, function (err, usr) {
                if (err) {
                    req.flash('error', 'Something Wants Wrong! Please Contact To Support.')
                    res.redirect('back');
                    console.log(err);
                    return;
                }
                req.flash('success', 'Succeed To Reset Password. Please Login With New Password.');
                ejs.renderFile("views/email/resetdone.ejs", function (err, html) {
                    if (err) {
                        req.flash('error', 'Something Wants Wrong!');
                        res.redirect('back');
                        console.log(err);
                        return;
                    }
                    mailer.send({
                        to: req.user.meta.email,
                        subject: "Password Reset Completed! - TKC4YOU",
                        html: html
                    });
                })
                res.redirect('back');
            })
        } else {
            req.flash('error', 'Please Enter Youe Current Password Properly.');
            res.redirect('back');
        }
    })

});
module.exports = router;
