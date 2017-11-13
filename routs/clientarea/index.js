const express = require('express');
const middlewares = require('../../includs/middlewares');
const router = express.Router();


// routes
const statementRoutes = require('./statement');
const ticketsRoutes = require('./tickets.js');
const referralRouts = require('./referral.js');
const withdrawalRouts = require('./withdrawal');

router.get('/', middlewares.ifLoggedIn, function (req, res) {
    res.render("clientarea/index.ejs");
});

router.use('/statement', statementRoutes);
router.use('/tickets', ticketsRoutes);
router.use('/referral', referralRouts);
router.use('/withdrawal', withdrawalRouts);

module.exports = router;
