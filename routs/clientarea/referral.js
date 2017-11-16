const express       = require('express');
const middlewares   = require('../../includs/middlewares');
const func          = require('../../includs/func');
var   router        = express.Router();
const userDB        = require('../../models/user');
const json          = require('json-parser');
const config        = require('../../config.js');


router.get('/', middlewares.ifLoggedIn, function(req, res) {
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
            res.render("clientarea/referrals/index.ejs", {users: users})
        })
        .catch( err => {
            if (err) {
                console.error(err);
                req.flash('error', 'Somthing Is Wents Wrong!')
                return res.redirect('back');
            }
        })
  // res.render('clientarea/referrals/index.ejs')
});


module.exports = router;
