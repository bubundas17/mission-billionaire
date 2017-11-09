const leclg 			  = require('le-challenge-fs');
const lestore 		  = require('le-store-certbot');
const express		 	  = require('express');
const mongoose	 	  = require('mongoose');
const bodyParser		  =	require('body-parser');
const methodOverride	  =	require('method-override');
const sessions		  = require('express-session');
const func          	  = require('./includs/func');
const flash 			  = require('express-flash');
const minify			  = require('express-minify');
const compression 	  = require('compression');
const cookieParser      = require('cookie-parser');
const http            = require('http');
const https           = require('https');
const redirectHttps   = require('redirect-https');
const passport        = require('passport');
const LocalStrategy   = require('passport-local');
const userDB          = require('./models/user.js')
const Insta             = require('instamojo-nodejs');
const sysinfoDB       = require('./models/sysinfo')


// app.use(require('serve-static')(__dirname + '/../../public'));
// app.use(require('body-parser').urlencoded({ extended: true }));
// app.use(require('express-session')({ secret: 'keyboard cat', repave: true, saveUninitialized: true }));
let config = require('./config');  // Site Configs


// Lets Encrypt Information.
const le = require('greenlock').create({
    server: 'https://acme-v01.api.letsencrypt.org/directory',
    configDir: 'certs/etc',
    approveDomains: (opts, certs, cb) => {
        if (certs) {
            opts.domains = ['tkc4you.com', 'www.tkc4you.com']
        } else {
            opts.email = 'tkc4you@gmail.com',
                opts.agreeTos = true;
        }
        cb(null, {
            options: opts,
            certs: certs
        });
    },
});


// func.giveDailyIncome()

const startup = require('./startup');

// console.log(process.argv.slice(2));
// initialization
const app = express();
mongoose.Promise = global.Promise;
mongoose.connect(config.database.connect, { useMongoClient: true });
app.use(bodyParser.urlencoded({extended: true}));
app.use(methodOverride('_method'));
app.use(cookieParser());
app.use(sessions(config.sessions));
app.use(passport.initialize());
app.use(passport.session());


// Passport Setups
passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  userDB.findById(id, function (err, user) {
    done(err, user);
  });
});
// Passport Local Setups

passport.use(new LocalStrategy(
  function(username, password, done) {

    userDB.findOne({$or: [{username: username}, {'meta.email': username}]}, function(err, user){
        if (err) {
            return done(err);
        }
      func.checkUser(username, password, pwd => {
        if (pwd) {
          done(null, user)
        } else {
          done(null, false)
        }
      })
    })
  }
));


Insta.setKeys(config.instaMojo.apiKey, config.instaMojo.authKey);
Insta.isSandboxMode(config.instaMojo.sandbox); // Test Mode

// Cron Job For Renew Service.
setInterval(startup.cron, 1000 * 60 * 60 * 24); // running cron job every
// startup.renewService()
if (process.argv.slice(2)[0] === "upgrade") {
	startup.update();
}
//
// if (process.argv.slice(2)[0] == "install") {
// 	install();
// }



app.use(flash());
app.use(func.global);
app.use(compression());
app.use(minify());
// Routs
const routs = require('./routs');
app.use(routs);

const port = process.env.PORT || 3001;

// Static Dir

// app.get('/debug', (req, res) => {
//     func.getReferableUser(req.user)
//         .then( ok => {
//             console.log(ok)
//         })
// });


app.use(express.static('./public'));
app.get('*', (req, res) => {
	res.render('404.ejs');
});



app.listen(3000, () => {
    console.log("Running The Server");
});

// http.createServer(le.middleware(redirectHttps())).listen(80, function() {
//   console.log("Server Running On http" + 80);
// })
//
// https.createServer(le.httpsOptions, le.middleware(app)).listen(443, function() {
//   console.log("Server Running On https" + 443);
// })
