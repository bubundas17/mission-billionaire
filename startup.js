var userDB = require('./models/user');
var func = require('./includs/func')
var ejs  = require('ejs');
var mailer = require('./includs/mailer')

module.exports = {
  cron(){
    func.giveDailyIncome()
  }
}
