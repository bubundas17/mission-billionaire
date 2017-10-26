const express       = require('express');
const middlewares   = require('../includs/middlewares');
const func          = require('../includs/func');
var   router        = express.Router();
const json          = require('json-parser');
const config        = require('../config.js')


const productDB     = require('../models/product')
const serviceDB     = require('../models/services')
const statementDB   = require('../models/statement')
const ticketDB      = require('../models/ticket')
const paymentDB     = require('../models/payment.js')
const tokenDB       = require('../models/token')
const userDB        = require('../models/user')
const ReferialincomeBD = require('../models/referialincome')
const sysinfoDB     = require('../models/sysinfo')
const nonworkingIncomeDB = require('../models/nonworkingincome')
const GoldIncomeDB = require('../models/goldIncmone')
const PlatinumIncomeDB = require('../models/platinumIncome')
const DimondIncomeDB = require('../models/dimondIncome')
const widwrawlDB     = require('../models/withdrawal')
const rechargeDB     = require('../models/recharge')


// Homepage Of Clientarea
router.get('/', middlewares.ifLoggedIn, middlewares.ifActive, function(req, res) {
  serviceDB.find({
    user: req.user._id
  }, function(err, found) {
    if (err) {
      req.flash('error', 'Somthing is wents wrong. Please Contact To System Admin.')
      res.redirect("/");
    } else {
      func.upgradeUser(req.user.id)
      res.render("clientarea/index.ejs", {
        services: found
      });
    }
  })
})

// Recharge portal
// Transation History
router.get('/statement', middlewares.ifLoggedIn, middlewares.ifActive, function(req, res) {
  serviceDB.find({
    user: req.user._id
  }, function(err, found) {
    if (err) {
      req.flash('error', 'Somthing is wents wrong!');
      return res.redirect('back');
    }
    statementDB.find({
      user: req.user._id
    }, function(err, transactions) {
      if (err) {
        req.flash('error', 'Somthing is wents wrong!');
        return res.redirect('back');
      }
      res.render('clientarea/statement.ejs', {
        transactions: transactions,
        services: found
      });
    })
  })
})

// Hosting list roughts
// Start of Tickets

var serviceActive = "ACTIVE"
var serviceAnswered = "ANSWERED"
var serviceClosed = "CLOSED"

router.get("/tickets", middlewares.ifLoggedIn, middlewares.ifActive, (req, res) => {
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



router.get("/tickets/new", middlewares.ifLoggedIn, middlewares.ifActive, (req, res) => {
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


router.get("/tickets/:id", middlewares.ifLoggedIn, middlewares.ifActive, (req, res) => {
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

router.post("/tickets/:id", middlewares.ifLoggedIn, middlewares.ifActive, (req, res) => {
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


router.post("/tickets", middlewares.ifLoggedIn,  middlewares.ifActive,  (req, res) => {
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


/***************************************************************************
******************************* User Activation ****************************
***************************************************************************/

router.get('/active',  middlewares.ifLoggedIn, middlewares.ifNotActive, (req, res) => {
  res.render('clientarea/activation/activate.ejs')
})

router.post('/active', (req, res) => {
  var token = req.body.token;
  var token = token.toUpperCase();
  tokenDB.findOne({ code: token })
    .then( cupon => {
      console.log(cupon);
      if (cupon == null) {
        req.flash('error','Invalid Token. Please Retry.')
        return res.redirect('back')
      }

      if (cupon.isUsed) {
        req.flash('error','Token Is Already Used!.')
        return res.redirect('back')
      }
      // Valied Cupon.
      if (cupon) {
        sysinfoDB.findOne({
          name: "Tkc4you"
        })
        .then( info => {
          info.dailyIncome += 30;
          info.save()
        })
        .catch( err => {
          console.log(err);
        })
        cupon.isUsed = true
        cupon.user = req.user
        req.user.isActive = true
        cupon.save()
        req.user.save()
        func.doRefCredit(req.user.upTree)
        req.flash('success','Your Account Has Been Activated!.')
        return res.redirect('/clientarea')
      }
    })
})



/*******************************************************************************
************************ Referral Income ***************************************
*******************************************************************************/

router.get('/income/referral',  middlewares.ifLoggedIn,  middlewares.ifActive, (req, res) => {
  res.locals.title = 'Referral Income ' + ' - ' + res.locals.title;
  var query = req.query.q || ".*"
  ReferialincomeBD.paginate({
    user: req.user
  },{
       page: req.query.page || 1,
       limit: 20,
       sort: '-date'
  })
    .then( data => {
      res.render('clientarea/income/referral.ejs', {data: data})
    })

})


router.get('/income/nonworking',  middlewares.ifLoggedIn,  middlewares.ifActive, (req, res) => {
  res.locals.title = 'Referral Income ' + ' - ' + res.locals.title;
  var query = req.query.q || ".*"
  nonworkingIncomeDB.paginate({
    user: req.user
  },{
       page: req.query.page || 1,
       limit: 20,
       sort: '-date'
  })
    .then( data => {
      res.render('clientarea/income/referral.ejs', {data: data})
    })

})


router.get('/income/gold',  middlewares.ifLoggedIn,  middlewares.ifActive, (req, res) => {
  res.locals.title = 'Referral Income ' + ' - ' + res.locals.title;
  var query = req.query.q || ".*"
  GoldIncomeDB.paginate({
    user: req.user
  },{
       page: req.query.page || 1,
       limit: 20,
       sort: '-date'
  })
    .then( data => {
      res.render('clientarea/income/gold.ejs', {data: data})
    })

})

router.get('/income/platinum',  middlewares.ifLoggedIn,  middlewares.ifActive, (req, res) => {
  res.locals.title = 'Referral Income ' + ' - ' + res.locals.title;
  var query = req.query.q || ".*"
  PlatinumIncomeDB.paginate({
    user: req.user
  },{
       page: req.query.page || 1,
       limit: 20,
       sort: '-date'
  })
    .then( data => {
      res.render('clientarea/income/platinum.ejs', {data: data})
    })

})

router.get('/income/dimond',  middlewares.ifLoggedIn,  middlewares.ifActive, (req, res) => {
  res.locals.title = 'Referral Income ' + ' - ' + res.locals.title;
  var query = req.query.q || ".*"
  DimondIncomeDB.paginate({
    user: req.user
  },{
       page: req.query.page || 1,
       limit: 20,
       sort: '-date'
  })
    .then( data => {
      res.render('clientarea/income/dimond.ejs', {data: data})
    })

})

// Widwrawl Paths
router.get('/widwrawl', middlewares.ifLoggedIn,  middlewares.ifActive, (req, res) => {
  Promise.all([widwrawlDB.find({user: req.user._id}), rechargeDB.find({user: req.user._id})])
    .then( reqs => {
      res.locals.title = 'Widwrawl Requests ' + ' - ' + res.locals.title;
      res.render('clientarea/widwrawl/index.ejs', {widwrawls: reqs[0], recharges: reqs[1]})
    })
    .catch( err => {
      console.log("Cannot read Database!");
      console.log(err);
    })
})

router.get('/widwrawl/tkc', middlewares.ifLoggedIn,  middlewares.ifActive, (req, res) => {
  res.locals.title = 'Widwrawl Via TKC Coin ' + ' - ' + res.locals.title;
  res.render('clientarea/widwrawl/tkc.ejs')
})

router.post('/widwrawl/tkc', middlewares.ifLoggedIn,  middlewares.ifActive, (req, res) => {
  var amount      =   req.body.amount
  tkc          =   parseInt(amount)
  sysinfoDB.findOne({ name: "Tkc4you" })
    .then( info => {
      if (tkc < 50) {
        req.flash("error", "Amount cannot be lessthan 50!");
        return res.redirect('back')
      }

      if (req.user.credits > amount) {
        req.user.credits -= amount
        req.user.save()
      } else {
        req.flash("error", "You do not have enough credits in your account");
        return res.redirect('back')
      }

      widwrawlDB.create({
        user: req.user._id,
        amount: amount,
        tkcaddress: req.user.tkc
      })
      .then(data => {
        req.flash("success", "Cool! Your request is submited!");
        res.redirect('back')
      })
      .catch( err => {
        req.flash("error", "Somthing is wents Wrong.");
        res.redirect('back')
        console.log("Database Update Failed!");
        console.log(err);
      })
    })
    .catch( err => {
      req.flash("error", "Somthing is wents Wrong.");
      res.redirect('back')
      console.log("Database Update Failed!");
      console.log(err);
    })
})

router.get('/widwrawl/recharge', middlewares.ifLoggedIn,  middlewares.ifActive, (req, res) => {
  res.locals.title = 'Widwrawl Via Mobile Recharge ' + ' - ' + res.locals.title;
  sysinfoDB.findOne({ name: "Tkc4you" })
    .then( info => {
      res.render('clientarea/widwrawl/recharge.ejs', {info})
    })

})

router.post('/widwrawl/recharge', middlewares.ifLoggedIn,  middlewares.ifActive, (req, res) => {
  const operator  =   req.body.operator
  const state     =   req.body.state
  const number    =   req.body.number
  var amount      =   req.body.amount
  amount          =   parseInt(amount)
  sysinfoDB.findOne({ name: "Tkc4you" })
    .then( info => {
      var tckAmount = (amount * info.tkcRates)
      console.log(tckAmount);
      if (tckAmount < 0) {
        req.flash("error", "Amount cannot be lessthan zero!");
        return res.redirect('back')
      }

      if (req.user.credits > tckAmount) {
        req.user.credits -= tckAmount
        req.user.save()
      } else {
        req.flash("error", "You do not have enough credits in your account");
        return res.redirect('back')
      }
      rechargeDB.create({
        user: req.user._id,
        info: {
          operator: operator,
          state: state,
          number: number,
          amount: amount
        },
        amount: tckAmount
      })
      .then(data => {
        req.flash("success", "Cool! Your request is submited!");
        return res.redirect('back')
      })
      .catch( err => {
        req.flash("error", "Somthing is wents Wrong.");
        res.redirect('back')
        console.log("Database Update Failed!");
        console.log(err);
      })
    })
    .catch( err => {
      req.flash("error", "Somthing is wents Wrong.");
      res.redirect('back')
      console.log("Database Update Failed!");
      console.log(err);
    })
})


// Referals Routs

router.get('/referrals/direct', middlewares.ifLoggedIn,  middlewares.ifActive, (req, res) => {
  var query = req.query.q || ".*"
  userDB.paginate({referedBy: req.user._id,
     $or: [

      {
        username: { "$regex": query + "", "$options": "i" }
      }, {
        name: { "$regex": query + "", "$options": "i" }
      }

    ]
  }, {
     page: req.query.page || 1,
     limit: 10
  })
  .then((users) => {
    res.render("clientarea/referrals/direct.ejs", {users: users})
  })
  .catch( err => {
    if (err) {
      console.error(err);
      req.flash('error', 'Somthing Is Wents Wrong!')
      return res.redirect('back');
    }
  })
})


module.exports = router;
