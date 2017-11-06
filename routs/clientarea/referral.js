const express       = require('express');
const middlewares   = require('../../includs/middlewares');
const func          = require('../../includs/func');
var   router        = express.Router();
const json          = require('json-parser');
const config        = require('../../config.js')


router.get('/', middlewares.ifLoggedIn, function(req, res) {
  res.render('clientarea/referrals/index.ejs')
})


module.exports = router;
