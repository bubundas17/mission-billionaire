var express       = require('express');
var router        = express.Router();
var TokenDB       = require('../../models/token')
var middlewares   = require('../../includs/middlewares');
var cupon         = require('voucher-code-generator');

router.get('/', middlewares.ifLoggedIn, middlewares.ifAdmin, (req, res) => {
  res.locals.title = 'View Tokens ' + ' - ' + res.locals.title;
  var query = req.query.q || ".*"
  TokenDB.paginate({ $or: [
    {
      "code": { "$regex": query + "", "$options": "i" }
    }
  ]
  },{
     page: req.query.page || 1,
     limit: 10,
     populate: 'user',
     sort: '-date'
  })
  .then(function(tokens){
    console.log(tokens);
      res.locals.title = 'View Plans' + ' - ' + res.locals.title;
      res.render('admin/token/index.ejs', {tokens: tokens});
  })
  .catch( (err) => {
    req.flash('error', 'Somthing Is Wents Wrong!')
    console.log(err);
    res.redirect('back');
  })
})


router.get('/generate', middlewares.ifLoggedIn, middlewares.ifAdmin, (req, res) => {
  res.render('admin/token/generate.ejs')
  console.log();
  // TokenDB.create({})
})

router.post('/new', middlewares.ifLoggedIn, middlewares.ifAdmin, (req, res) => {
    var amount = parseInt(req.body.amount)
    var cupons = cupon.generate({
      pattern: "####-####-####",
      count: amount
    })
    var task = [];
    cupons.forEach( cpn => {
      task.push(TokenDB.create({
          code: cpn.toUpperCase()
          }))
    })
  console.log(cupons);
    Promise.all(task)
      .then( ok =>{
        res.render('admin/token/newcupon.ejs', {tokens: cupons})
      })
      .catch( err => {
        console.log(err);
        return req.flash('error', 'Somthing Wents Wrong')
        res.redirect('back')
      })
})
module.exports = router;
