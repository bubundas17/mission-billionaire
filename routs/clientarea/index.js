const express       = require('express');
const middlewares   = require('../../includs/middlewares');
const func          = require('../../includs/func');
const   router        = express.Router();
const json          = require('json-parser');
const config        = require('../../config.js')


// routes
const statementRoutes = require('./statement')
const ticketsRoutes   = require('./tickets.js')
router.get('/', middlewares.ifLoggedIn, function(req, res) {
      func.upgradeUser(req.user.id)
      res.render("clientarea/index.ejs");
})

router.use('/statement', statementRoutes)
router.use('/tickets', ticketsRoutes)

module.exports = router;
