const express = require('express');
const router = express.Router();
const TokenDB = require('../../models/token');
const middlewares = require('../../includs/middlewares');
const cupon = require('voucher-code-generator');

router.get('/', middlewares.ifLoggedIn, middlewares.ifAdmin, (req, res) => {
    res.locals.title = 'View Tokens ' + ' - ' + res.locals.title;
    const query = req.query.q || ".*";
    TokenDB.paginate({
        $or: [
            {
                "code": {"$regex": query + "", "$options": "i"}
            }
        ]
    }, {
        page: req.query.page || 1,
        limit: 10,
        populate: 'user',
        sort: '-date'
    })
        .then(function (tokens) {
            console.log(tokens);
            res.locals.title = 'View Plans' + ' - ' + res.locals.title;
            res.render('admin/token/index.ejs', {tokens: tokens});
        })
        .catch((err) => {
            req.flash('error', 'Something Is Wants Wrong!');
            console.log(err);
            res.redirect('back');
        })
})


router.get('/generate', middlewares.ifLoggedIn, middlewares.ifAdmin, (req, res) => {
    res.render('admin/token/generate.ejs')
    console.log();
    // TokenDB.create({})
});

router.post('/new', middlewares.ifLoggedIn, middlewares.ifAdmin, (req, res) => {
    let amount = parseInt(req.body.amount);
    let cupons = cupon.generate({
        pattern: "####-####-####",
        count: amount
    });
    let task = [];
    cupons.forEach(cpn => {
        task.push(TokenDB.create({
            code: cpn.toUpperCase()
        }))
    });
    console.log(cupons);
    Promise.all(task)
        .then(ok => {
            res.render('admin/token/newcupon.ejs', {tokens: cupons})
        })
        .catch(err => {
            console.log(err);
            return req.flash('error', 'Something Wants Wrong');
            res.redirect('back');
        })
});
module.exports = router;
