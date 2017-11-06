const express       = require('express');
const middlewares   = require('../../includs/middlewares');
const func          = require('../../includs/func');
const   router        = express.Router();
const json          = require('json-parser');
const config        = require('../../config.js')


// routes
const statementRoutes = require('./statement')
const ticketsRoutes   = require('./tickets.js')
const referralRouts   = require('./referral.js')
router.get('/', middlewares.ifLoggedIn, function(req, res) {
      res.render("clientarea/index.ejs");
})

router.use('/statement', statementRoutes)
router.use('/tickets', ticketsRoutes)
router.use('/referral', referralRouts)

module.exports = router;
