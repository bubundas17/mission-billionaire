var express       = require('express');
var router        = express.Router();
var userDB        = require('../../models/user');
var middlewares   = require('../../includs/middlewares');
var func          = require('../../includs/func')

// Config values
var userListPerPage = 10;

router.get('/', middlewares.ifLoggedIn, middlewares.ifAdmin, (req, res) => {
  var query = req.query.q || ".*"
  userDB.paginate({ $or: [

      {
        username: { "$regex": query + "", "$options": "i" }
      }, {
        name: { "$regex": query + "", "$options": "i" }
      }
    
    ]
  }, {
     page: req.query.page || 1,
     limit: userListPerPage
  })
  .then((users) => {
    res.render("admin/users/userlist.ejs", {users: users})
  })
  .catch( err => {
    if (err) {
      console.error(err);
      req.flash('error', 'Somthing Is Wents Wrong!')
      return res.redirect('back');
    }
  })
})

router.get('/:id', middlewares.ifLoggedIn, middlewares.ifAdmin, (req, res) => {
  userDB.findById(req.params.id)
  .then( user => {
    console.log(user);
    res.render("admin/users/viewUser.ejs", {user: user})
  })
  .catch( err => {
    req.flash('error', 'Somthing Is Wents Wrong! Please Contact To Bubun.')
    return  res.redirect('back');

  })
})
router.put('/:id', middlewares.ifLoggedIn, middlewares.ifAdmin, (req, res) => {
  userDB.findById(req.params.id)
  .then( user => {

    switch (req.query.type) {
      case "password":
      func.setPassword(user, req.body.password, (err, ok) => {
        if (err) {
          req.flash('error', 'Upps! Somthing Wents Wrong. Please Cotact To Bubun.')
          res.redirect('back');
          console.log(err);
        } else {
          req.flash('success', 'Saved')
          res.redirect('back');
        }
      })
      console.log(req.query.type);
      break;


      case "credits":
      // console.log(req.query.type);
      user.credits = parseInt(req.body.credits);
      user.save(function(err){
        if (err) {
          req.flash('error', 'Upps! Somthing Wents Wrong. Please Cotact To Bubun.')
          res.redirect('back');
          console.log(err);
        } else {
          req.flash('success', 'Saved')
          res.redirect('back');
        }
      })
      break;


      case "address":
      user.meta.email            = req.body.email;
      user.meta.phone            = req.body.phone;
      user.meta.dateOfBarth      = req.body.dateOfBarth;
      user.meta.address.country  = req.body.country;
      user.meta.address.state    = req.body.state;
      user.meta.address.city     = req.body.city;
      user.meta.address.address1 = req.body.address1;
      user.meta.address.address2 = req.body.address2;
      user.save(function(err){
        if (err) {
          req.flash('error', 'Upps! Somthing Wents Wrong. Please Cotact To Administrator')
          res.redirect('/profile');
        } else {
          req.flash('success', 'Saved')
          res.redirect('/profile');
        }
      })
      break;


    }

  })
  .catch( err => {
    req.flash('error', 'Somthing Is Wents Wrong! Please Contact To Bubun.')
    return  res.redirect('back');

  })
})

router.get('/:id/edit', middlewares.ifLoggedIn, middlewares.ifAdmin, (req, res) => {

  userDB.findById(req.params.id)
    .then( user => {
      console.log(user);
      res.render("admin/users/editUser.ejs", {user: user})
    })
    .catch( err => {
      req.flash('error', 'Somthing Is Wents Wrong! Please Contact To Bubun. :D')
      console.error(err);
      return  res.redirect('back');

    })
})





module.exports = router
