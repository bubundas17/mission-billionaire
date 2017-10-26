const sysinfoDB  = require('./models/sysinfo')
console.log("Tkc4you.com Software Installer");

module.exports = () => {
  sysinfoDB.create({
    name: "Tkc4you"
  })
  .then( ok => {
    console.log(ok);
  })
  .catch( err => {
    console.log(err);
  })

}
