const express = require('express');
const router = express.Router();
const userDB = require('../../models/user');
const middlewares = require('../../includs/middlewares');
const func = require('../../includs/func');

// Config values
const userListPerPage = 10;
router.get('/', middlewares.ifLoggedIn, middlewares.ifAdmin, (req, res) => {
    let query = req.query.q || ".*";
    userDB.paginate({
        $or: [
            {
                username: {"$regex": query + "", "$options": "i"}
            }, {
                name: {"$regex": query + "", "$options": "i"}
            }

        ]
    }, {
        page: req.query.page || 1,
        limit: userListPerPage,
        sort:     { _id: -1 }
    })
        .then((users) => {
            res.render("admin/users/userlist.ejs", {users: users});
        })
        .catch(err => {
            if (err) {
                console.error(err);
                req.flash('error', 'Something Is Wants Wrong!');
                return res.redirect('back');
            }
        })
});

router.get('/active', middlewares.ifLoggedIn, middlewares.ifAdmin, (req, res) => {
    var query = req.query.q || ".*";
    userDB.paginate({
        $or: [
            {
                username: {"$regex": query + "", "$options": "i"}, isActive: false
            }, {
                name: {"$regex": query + "", "$options": "i"}, isActive: false
            }
        ]
    }, {
        page: req.query.page || 1,
        limit: userListPerPage,
        sort:     { _id: -1 }
    })
        .then((users) => {
            res.render("admin/users/activeUser.ejs", {users: users});
        })
        .catch(err => {
            console.log(err)
            if (err) {
                console.log(err);
                req.flash('error', 'Something Is Wants Wrong!');
                return res.redirect('back');
            }
        })
});

router.get('/:id/view', middlewares.ifLoggedIn, middlewares.ifAdmin, (req, res) => {
    userDB.findById(req.params.id)
        .then(user => {
            console.log(user);
            res.render("admin/users/viewUser.ejs", {user: user})
        })
        .catch(err => {
            req.flash('error', 'Something Is Wants Wrong! Please Contact To Administrator.');
            return res.redirect('back');
        });
});

router.get('/:id/active', middlewares.ifLoggedIn, middlewares.ifAdmin, (req, res) => {
    userDB.findById(req.params.id)
        .then(user => {
            console.log(user);
            res.render("admin/users/active.ejs", {user: user})
        })
        .catch(err => {
            req.flash('error', 'Something Is Wants Wrong! Please Contact To Administrator.');
            return res.redirect('back');
        });
});

router.post('/:id/active', middlewares.ifLoggedIn, middlewares.ifAdmin, (req, res) => {
    userDB.findById(req.params.id)
        .then(user => {
            res.render("admin/users/active.ejs", {user: user})
        })
        .catch(err => {
            req.flash('error', 'Something Is Wants Wrong! Please Contact To Administrator.');
            return res.redirect('back');
        });
});


router.put('/:id', middlewares.ifLoggedIn, middlewares.ifAdmin, (req, res) => {
    userDB.findById(req.params.id)
        .then(user => {
            switch (req.query.type) {
                case "password":
                    func.setPassword(user, req.body.password, (err, ok) => {
                        if (err) {
                            req.flash('error', 'Upps! Something Wants Wrong. Please Contact To Administrator.');
                            res.redirect('back');
                            console.log(err);
                        } else {
                            req.flash('success', 'Saved');
                            res.redirect('back');
                        }
                    });
                    console.log(req.query.type);
                    break;
                case "credits":
                    // console.log(req.query.type);
                    user.credits = parseInt(req.body.credits);
                    user.save(function (err) {
                        if (err) {
                            req.flash('error', 'Upps! Something Wants Wrong.');
                            res.redirect('back');
                            console.log(err);
                        } else {
                            req.flash('success', 'Saved');
                            res.redirect('back');
                        }
                    });
                    break;


                case "address":
                    user.meta.email = req.body.email;
                    user.meta.phone = req.body.phone;
                    user.meta.dateOfBarth = req.body.dateOfBarth;
                    user.meta.address.country = req.body.country;
                    user.meta.address.state = req.body.state;
                    user.meta.address.city = req.body.city;
                    user.meta.address.address1 = req.body.address1;
                    user.meta.address.address2 = req.body.address2;
                    user.save(function (err) {
                        if (err) {
                            req.flash('error', 'Upps! Something Wants Wrong. Please Contact To Administrator');
                            res.redirect('/profile');
                        } else {
                            req.flash('success', 'Saved');
                            res.redirect('/profile');
                        }
                    });
                    break;


            }

        })
        .catch(err => {
            req.flash('error', 'Something Is Wants Wrong! Please Contact To Administrator.');
            return res.redirect('back');
        })
});

router.get('/:id/edit', middlewares.ifLoggedIn, middlewares.ifAdmin, (req, res) => {
    userDB.findById(req.params.id)
        .then(user => {
            console.log(user);
            res.render("admin/users/editUser.ejs", {user: user})
        })
        .catch(err => {
            req.flash('error', 'Something Is Wants Wrong! Please Contact Admin.');
            console.error(err);
            return res.redirect('back');
        })
});

module.exports = router;
