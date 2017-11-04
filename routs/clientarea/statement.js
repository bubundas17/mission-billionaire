const express       = require('express');
const middlewares   = require('../../includs/middlewares');
const func          = require('../../includs/func');
var   router        = express.Router();
const json          = require('json-parser');
const config        = require('../../config.js')

// Recharge portal
// Transation History
router.get('/', middlewares.ifLoggedIn, middlewares.ifActive, function(req, res) {
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


module.exports = router;
