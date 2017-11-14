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
    req.user.bitcoin = req.body.bitcoin;
    req.user.save(function (err) {
        if (err) {
            req.flash('error', 'Ups! Something Wants Wrong. Please Contact To Administrator');
            res.redirect('/profile');
        } else {
            req.flash('success', 'Saved');
            res.redirect('/profile');
        }
    })
});

router.get('/chengepass', middlewares.ifLoggedIn, (req, res) => {
    res.render('profile/chengepass.ejs')
});

router.post('/chengepass', middlewares.ifLoggedIn, (req, res) => {
    let oldpassword = req.body.oldpass;
    let newPass = req.body.newpass;

    func.checkUser(req.user.username, oldpassword, pass => {
        if (pass) {
            func.setPassword(req.user, newPass, function (err, usr) {
                if (err) {
                    req.flash('error', 'Something Wants Wrong! Please Contact To Support.');
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
                        subject: "Password Reset Completed! - Mission Billionaire",
                        html: html
                    });
                });
                res.redirect('back');
            })
        } else {
            req.flash('error', 'Please Enter Your Current Password Properly.');
            res.redirect('back');
        }
    })

});
module.exports = router;
