var express = require('express');
var router = express.Router();

router.get('/tos', function (req, res) {
    res.render('footer/tos.ejs');
});
router.get('/privacy', function (req, res) {
    res.render('footer/privacy.ejs');
});

module.exports = router;
