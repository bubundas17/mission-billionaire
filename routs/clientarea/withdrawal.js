const express       = require('express');
const middlewares   = require('../../includs/middlewares');
const func          = require('../../includs/func');
const router = express.Router();


const sysinfoDB     = require('../../models/sysinfo');
const widwrawlDB     = require('../../models/withdrawal');
const rechargeDB     = require('../../models/recharge');

// Widwrawl Paths
router.get('/', middlewares.ifLoggedIn,  middlewares.ifActive, (req, res) => {
    Promise.all([widwrawlDB.find({user: req.user._id}), rechargeDB.find({user: req.user._id})])
        .then( reqs => {
            res.locals.title = 'Widwrawl Requests ' + ' - ' + res.locals.title;
            res.render('clientarea/widwrawl/index.ejs', {widwrawls: reqs[0], recharges: reqs[1]})
        })
        .catch( err => {
            console.log("Cannot read Database!");
            console.log(err);
        })
});

router.get('/tkc', middlewares.ifLoggedIn,  middlewares.ifActive, (req, res) => {
    res.locals.title = 'Widwrawl Via TKC Coin ' + ' - ' + res.locals.title;
    res.render('clientarea/widwrawl/tkc.ejs')
});

router.post('/tkc', middlewares.ifLoggedIn,  middlewares.ifActive, (req, res) => {
    let amount = req.body.amount;
    let tkc = parseInt(amount);
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
                    req.flash("success", "Cool! Your request is submitted!");
                    res.redirect('back')
                })
                .catch( err => {
                    req.flash("error", "Something is wants Wrong.");
                    res.redirect('back');
                    console.log("Database Update Failed!");
                    console.log(err);
                })
        })
        .catch( err => {
            req.flash("error", "Something is wants Wrong.");
            res.redirect('back');
            console.log("Database Update Failed!");
            console.log(err);
        })
});

router.get('/recharge', middlewares.ifLoggedIn,  middlewares.ifActive, (req, res) => {
    res.locals.title = 'Widwrawl Via Mobile Recharge ' + ' - ' + res.locals.title;
    sysinfoDB.findOne({ name: "Tkc4you" })
        .then( info => {
            res.render('clientarea/widwrawl/recharge.ejs', {info})
        })

});

router.post('/recharge', middlewares.ifLoggedIn,  middlewares.ifActive, (req, res) => {
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
});

module.exports = router;
