// Imports
const express = require('express');
const ticketsDB = require('../../models/ticket');
const middlewares = require('../../includs/middlewares');


// Routs
const ticketsRoutes = require('./tickets');
const rechargeRoutes = require('./recharge');
const usersRoutes = require('./users');
const token = require('./token');
const widwrawls = require('./widwral');


const router = express.Router();

router.get("/", middlewares.ifLoggedIn, middlewares.ifAdmin, function (req, res) {
    res.locals.title = 'Admin Area' + ' - ' + res.locals.title;
    res.render('admin/index.ejs')
});

router.use('/recharge', rechargeRoutes);
router.use('/tickets', ticketsRoutes);
router.use('/users', usersRoutes);
router.use('/token', token);
router.use('/widwrawl', widwrawls);

module.exports = router;
