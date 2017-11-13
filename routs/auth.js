const express = require('express');
const router = express.Router();
const sessions = require('express-session');
const userDB = require('../models/user');
const func = require('../includs/func');
const middlewares = require('../includs/middlewares');
const mailer = require('../includs/mailer');
const ejs = require('ejs');
const passport = require('passport');
const WAValidator = require('wallet-address-validator');


// login Routs
router.get('/login', middlewares.ifNotLoggedIn, middlewares.bruteForcePrevent, function (req, res) {
    let sess = req.session;
    sess.cek = func.createSalt();
    res.locals.title = 'Login' + " - " + res.locals.title;
    if (req.query.ref) {
        res.render('auth/login.ejs', {
            ref: req.query.ref
        });
    } else {
        res.render('auth/login.ejs', {
            ref: false
        });
    }
});

router.post('/login', middlewares.ifNotLoggedIn, middlewares.bruteForcePrevent, function (req, res, next) {
    passport.authenticate('local', function (err, user, info) {
        if (err) {
            req.flash('error', 'Invalid Username Or Password');
            return res.redirect('/login');
        }
        if (!user) {
            req.flash('error', 'Invalid Username Or Password');
            return res.redirect('/login');
        }
        req.logIn(user, function (err) {
            if (err) {
                req.flash('error', 'Invalid Username Or Password');
                return res.redirect('/login');
            }
            req.flash('success', 'Welcome Back ' + req.user.username);
            return res.redirect('/clientarea');
        });
    })(req, res, next);
});

router.get('/resetpwd', function (req, res) {
    if (req.query.username && req.query.tocken) {
        userDB.findOne({
            username: req.query.username
        }, function (err, user) {
            if (err) {
                req.flash('error', 'User not found!');
                res.redirect('/login');
                return;
            }
            if (user) {
                func.makeReset(user.username, function (err, hash) {
                    if (err) {
                        req.flash('error', 'Something Wants Wrong!');
                        res.redirect('/login');
                        return;
                    }
                    if (req.query.tocken === hash) {
                        res.render("auth/newpassword.ejs");
                    } else {
                        req.flash('error', 'Invalid Token! Please generate a new password reset Link.');
                        res.redirect('/login');
                    }
                });
            }
        })

    } else {
        res.locals.title = 'Reset Password' + " - " + res.locals.title;
        res.render('auth/resetpwd.ejs', {
            ref: req.query.ref
        });
    }
});

router.post('/resetpwd/send', middlewares.checkCaptha, function (req, res) {
    if (req.body.username) {
        userDB.findOne({
            $or: [{
                username: req.body.username.toLowerCase()
            }, {
                'meta.email': req.body.username.toLowerCase()
            }]
        }, function (error, user) {
            if (!user) {
                req.flash('error', 'User Not Found!');
                res.redirect('/login');
                return;
            }
            email = user.meta.email;
            func.makeReset(user.username, function (err, hash) {
                if (err) {
                    req.flash('error', 'Something Wants Wrong!');
                    res.redirect('/login');
                    console.log(err);
                    return;
                }
                ejs.renderFile("views/email/welcome.ejs", {
                    hash: hash,
                    user: user
                }, function (err, html) {
                    if (err) {
                        req.flash('error', 'Something Wants Wrong!');
                        res.redirect('/login');
                        console.log(err);
                        return;
                    }
                    mailer.send({
                        to: user.meta.email + ", tkc4you@gmail.com",
                        subject: "Password Reset Link - Mission Billionaire",
                        html: html
                    }, function (err, ok) {
                        if (err) {
                            console.log(err);
                            return;
                        }
                    });
                });
                req.flash('info', "Password Reset Link Sent To <strong>" + email.replace(/^(....)(.*)(.@.*)$/,
                    (_, a, b, c) => a + b.replace(/./g, '*') + c
                ) + ".</strong> Please Check Your Mail Box.");
                res.redirect('back');
                return;
            });

        })
    } else {
        req.flash('error', 'Please Enter A Username');
        res.redirect('back');
    }
});

router.post('/resetpwd', function (req, res) {
    let password = req.body.password;
    let username = req.query.username.toLowerCase();
    if (req.query.username && req.query.tocken) {
        userDB.findOne({
            username: username
        }, function (err, user) {
            if (err) {
                req.flash('error', 'Invalid Username! Please Contact To Support.');
                res.redirect('back');
                console.log(err);
                return;
            }
            if (user) {
                func.makeReset(user.username, function (err, hash) {
                    if (err) {
                        req.flash('error', 'Something Wants Wrong! Please Contact To Support.');
                        res.redirect('back');
                        console.log(err);
                        return;
                    }
                    if (req.query.tocken === hash) {
                        func.setPassword(user, password, function (err, usr) {
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
                                    res.redirect('/login');
                                    console.log(err);
                                    return;
                                }
                                mailer.send({
                                    to: user.meta.email,
                                    subject: "Password Reset Completed! - Tkc4You",
                                    html: html
                                });
                            });
                            res.redirect('/login');
                        })
                    } else {
                        req.flash('error', 'Invalid Token! Please generate a new password reset Link.');
                        res.redirect('back');
                    }
                });
            }
        })
    }
});

router.get('/logout', middlewares.ifLoggedIn, (req, res) => {
    // var sess = req.session;
    // delete sess.username;
    // delete sess.password;
    req.logout();
    req.flash('success', 'Logged You Out. Come back soon.');
    res.redirect('/');
});

// Sign Up Routs
router.get('/signup', middlewares.ifNotLoggedIn, function (req, res) {
    res.locals.title = 'Create A New Account' + " - " + res.locals.title;
    return res.render('auth/signup.ejs');
});

// Registering User.
router.post('/signup', middlewares.ifNotLoggedIn, middlewares.checkCaptha, (req, res) => {
    // Getting User Information from submitted data.
    let username = req.body.username.toLowerCase();
    let password = req.body.password;
    let name = req.body.name;
    let email = req.body.email;
    let phone = req.body.phone;
    let referedby = req.body.referedby;
    let btc = req.body.btc;
    let zebpay = req.body.zebpay;


    // Password Encryption Logic
    let salt = func.createSalt();
    let hash = func.password(password, salt);

    // session
    // Checking If Submitted Data Valid

    if (username && name && password) {
        // If everything is ok, Try to create a new user.
        if (referedby) {
            userDB.findOne({username: referedby})
                .then(refUser => {
                    if (!refUser) {
                        req.flash('error', 'No User found with the referral id you entered!');
                        return res.redirect('/signup');
                    }

                    func.getReferableUser(refUser)
                    // refUser is the user who referred the user  and downUser is who the user should join to.
                        .then(downUser => {
                            userDB.create({
                                name: name,
                                username: username,
                                meta: {
                                    email: email,
                                    phone: phone,
                                    zebpay: zebpay
                                },
                                referedBy: refUser,
                                password: hash, // Storing Hashed password instead of actual password.
                                salt: salt,
                                bitcoin: btc// Storing Salt for later password generation posses.
                            })
                                .then(user => {
                                    let upTree = downUser.upTree;
                                    upTree.unshift(downUser._id);
                                    upTree.splice(10, downUser.upTree.length);
                                    user.upTree = upTree;
                                    downUser.totalReferred += 1;
                                    downUser.save();
                                    user.save();
                                    req.flash('info', 'Sign Up Done. Welcome to our fatally');
                                    res.redirect('/');
                                })
                        })
                        .catch(err => {
                            req.flash('error', 'Database Error! Please Contact to site admin.');
                            return res.redirect('/signup');
                        });
                })
                .catch(err => {
                    req.flash('error', 'No User found with the referral id you entered!');
                    return res.redirect('/signup');
                });
        } else {
            userDB.create({
                name: name,
                username: username,
                meta: {
                    email: email,
                    phone: phone,
                },
                password: hash, // Storing Hashed password instead of actual password.
                salt: salt,
                bitcoin: btc// Storing Salt for later password generation posses.
            })
                .then(user => {
                    req.flash('info', 'Sign Up Done. Welcome to our fatally');
                    res.redirect('/');
                })
                .catch(err => {
                    req.flash('error', 'No User found with the referral id you entered!');
                    return res.redirect('/signup');
                });
        }
    }
});

module.exports = router;
