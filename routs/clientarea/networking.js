const express       = require('express');
const middlewares   = require('../../includs/middlewares');
const func          = require('../../includs/func');
var   router        = express.Router();
const json          = require('json-parser');
const config        = require('../../config.js');
const userDB = require("../../models/user");


router.get('/referrals/direct', middlewares.ifLoggedIn,  middlewares.ifActive, (req, res) => {
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
            res.render("clientarea/referrals/direct.ejs", {users: users})
        })
        .catch( err => {
            if (err) {
                console.error(err);
                req.flash('error', 'Something Is Wants Wrong!');
                return res.redirect('back');
            }
        })
});

module.exports = router;