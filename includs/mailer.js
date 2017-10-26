var nodemailer = require('nodemailer');
var htmlToText = require('nodemailer-html-to-text').htmlToText;
var config     =  require('../config');
var func ={}
// create reusable transporter object using the default SMTP transport
let transporter = nodemailer.createTransport(config.mailer);

// Html To Text Auto Template.
transporter.use('compile', htmlToText());

func.send  = function(info, callback){
  transporter.sendMail({
   from: '"AtoZServer" <noreply@atozserver.com>', // sender address
   to: info.to, // list of receivers
   subject: info.subject, // Subject line
   html: info.html // html body
 }, (error, msginfo) => {
   if (error) {
       return callback(error, null);
   }
   callback(null, msginfo)
  });
}

module.exports  = func;
