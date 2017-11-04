var express = require('express');
var router = express.Router();
var sessions = require('express-session');
var userDB = require('../models/user');
var func = require('../includs/func');
var middlewares = require('../includs/middlewares');
var mailer = require('../includs/mailer');
var ejs = require('ejs');
var passport = require('passport');
var WAValidator = require('wallet-address-validator');



// login Routs
router.get('/login', middlewares.ifNotLoggedIn, middlewares.bruteForcePrevent, function(req, res) {
  var sess = req.session;
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



router.post('/login', middlewares.ifNotLoggedIn, middlewares.bruteForcePrevent, function(req, res, next) {
  passport.authenticate('local', function(err, user, info) {
    if (err) {
      req.flash('error', 'Invalied Username Or Password');
      return res.redirect('/login');
    }
    if (!user) {
      req.flash('error', 'Invalied Username Or Password');
      return res.redirect('/login');
    }
    req.logIn(user, function(err) {
      if (err) {
          req.flash('error', 'Invalied Username Or Password');
          return res.redirect('/login');
      }
        req.flash('success', 'Welcome Back ' + req.user.username);
        return res.redirect('/clientarea');
    });
  })(req, res, next);
});

router.get('/resetpwd', function(req, res) {
  if (req.query.username && req.query.tocken) {
    userDB.findOne({
      username: req.query.username
    }, function(err, user) {
      if (err) {
        req.flash('error', 'User not found!');
        res.redirect('/login');
        return;
      }
      if (user) {
        func.makeReset(user.username, function(err, hash) {
          if (err) {
            req.flash('error', 'Somthing Wents Wrong!')
            res.redirect('/login');
            return;
          }
          if (req.query.tocken == hash) {
            res.render("auth/newpassword.ejs");
          } else {
            req.flash('error', 'Invalid Tocken! Please generate a new password reset Link.')
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
})

router.post('/resetpwd/send', middlewares.checkCaptha, function(req, res) {
  if (req.body.username) {
    userDB.findOne({
      $or: [{
        username: req.body.username.toLowerCase()
      }, {
        'meta.email': req.body.username.toLowerCase()
      }]
    }, function(error, user) {
      if (!user) {
        req.flash('error', 'User Not Found!')
        res.redirect('/login');
        return;
      }
      email = user.meta.email;
      func.makeReset(user.username, function(err, hash) {
        if (err) {
          req.flash('error', 'Somthing Wents Wrong!')
          res.redirect('/login');
          console.log(err);
          return;
        }
        ejs.renderFile("views/email/welcome.ejs", {
          hash: hash,
          user: user
        }, function(err, html) {
          if (err) {
            req.flash('error', 'Somthing Wents Wrong!')
            res.redirect('/login');
            console.log(err);
            return;
          }
          mailer.send({
            to: user.meta.email + ", tkc4you@gmail.com",
            subject: "Password Reset Link - Tkc4you",
            html: html
          }, function(err, ok) {
            if (err) {
              console.log(err);
              return;
            }
          });
        })
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
})


router.post('/resetpwd', function(req, res) {
  var password = req.body.password;
  var username = req.query.username.toLowerCase();
  if (req.query.username && req.query.tocken) {
    userDB.findOne({
      username: username
    }, function(err, user) {
      if (err) {
        req.flash('error', 'Invalied Username! Please Contact To Support.')
        res.redirect('back');
        console.log(err);
        return;
      }
      if (user) {
        func.makeReset(user.username, function(err, hash) {
          if (err) {
            req.flash('error', 'Somthing Wents Wrong! Please Contact To Support.')
            res.redirect('back');
            console.log(err);
            return;
          }
          if (req.query.tocken == hash) {
            func.setPassword(user, password, function(err, usr) {
              if (err) {
                req.flash('error', 'Somthing Wents Wrong! Please Contact To Support.')
                res.redirect('back');
                console.log(err);
                return;
              }
              req.flash('success', 'Succeed To Reset Password. Please Login With New Password.');
              ejs.renderFile("views/email/resetdone.ejs", function(err, html) {
                if (err) {
                  req.flash('error', 'Somthing Wents Wrong!')
                  res.redirect('/login');
                  console.log(err);
                  return;
                }
                mailer.send({
                  to: user.meta.email,
                  subject: "Password Reset Completed! - Tkc4You",
                  html: html
                });
              })
              res.redirect('/login');
            })
          } else {
            req.flash('error', 'Invalid Tocken! Please generate a new password reset Link.')
            res.redirect('back');
          }
        });
      }
    })
  }
})

router.get('/logout', middlewares.ifLoggedIn, function(req, res) {
  // var sess = req.session;
  // delete sess.username;
  // delete sess.password;
  req.logout();
  req.flash('success', 'Logged You Out. Come back soon.');
  res.redirect('/');
})

// Sign Up Routs
router.get('/signup', middlewares.ifNotLoggedIn, function(req, res) {
  res.locals.title = 'Create A New Account' + " - " + res.locals.title;
  return res.render('auth/signup.ejs');
});

// Registering User.
router.post('/signup', middlewares.ifNotLoggedIn, middlewares.checkCaptha, function(req, res) {
  // Getting User Information from submitted data.
  var username = req.body.username.toLowerCase();
  var password = req.body.password;
  var name = req.body.name;
  var email = req.body.email;
  var phone = req.body.phone;


  // Password Encryption Logic
  var salt = func.createSalt();
  var hash = func.password(password, salt);

  // session
  var sess = req.session;

  // Checking If Submited Data Valied
  if (username && name && password) {

    // If everything is ok, Try to create a new user.
    userDB.create({
      name: name,
      username: username,
      meta: {
        email: email,
        phone: phone,
      },
      password: hash, // Storing Hashed password instead of actual password.
      salt: salt // Storing Salt for later password generation prosses.
    }).then(user =>  {
      if (err) {
        req.flash('error', 'Username already exlished');
        return res.redirect('/signup');
      }

      // console.log(user);
      // Storing User Information in session.
      req.flash('info', 'Signup Done. Welcome to our famally')
      res.redirect('/');
    })
  }
});

module.exports = router;
