/*eslint-env node*/

//------------------------------------------------------------------------------
// node.js starter application for Bluemix
//------------------------------------------------------------------------------

// This application uses express as its web server
// for more info, see: http://expressjs.com
var express = require('express');

// cfenv provides access to your Cloud Foundry environment
// for more info, see: https://www.npmjs.com/package/cfenv
var cfenv = require('cfenv');

// create a new express server
var app = express();

var router = express.Router();

// serve the files out of ./public as our main files
app.use(express.static(__dirname + '/public'));

// get the app environment from Cloud Foundry
var appEnv = cfenv.getAppEnv();

// Load the Cloudant library.
// var Cloudant = require('cloudant');
//
// var user = '5a2aae75-8086-4b41-bba7-e4936e7a2776-bluemix';
// var pw = '9e4a882af9810b380dc5590a4c2d1b57ba8597eed203a906e7026d8bf6433436';
// var url = '5a2aae75-8086-4b41-bba7-e4936e7a2776-bluemix.cloudant.com';

// var cloudant = Cloudant({
//   host: url, account: user, username: user, password: pw,
// }, function(err, cloudant) {
//       if(err){
//         return console.log('Datenbankverbindung fehlgeschlagen' + err.message);
//       }
//       vrauslandservice = cloudant.db.use('vrauslandservice');
//       console.log('Datenbankverbindung erfolgreich hergestellt');
//     });


// uncomment for initial data in cloudant
// var insertJson = require('./misc/daten.json');
// cloudant.db.destroy('vrauslandservice', function (err) {
//   cloudant.db.create('vrauslandservice', function () {
//     vrauslandservice = cloudant.db.use('vrauslandservice');
//
//     for (var country in insertJson) {
//       vrauslandservice.insert(insertJson[country], country);
//       console.log('key:' + country + ' value:' + insertJson[country]);
//     }
//
//   });
// });

app.listen(appEnv.port, '0.0.0.0', function () {
  console.log('server starting on ' + appEnv.url);
    var welt = require('./public/js/maps/jquery.vmap.world2.js');
  console.log(welt);
});

// router.get('/country/:id', function (req, res) {
//   vrauslandservice.get(req.params.id, function (err, data) {
//       if (err)
//       {
//         res.json({ error: 'Land nicht gefunden.' });
//       } else {
//         res.json(data);
//       }
//     });
// });

router.get('/countries', function (req, res) {
  var daten = require('./misc/daten.json');
  res.send(daten);
});

router.get('/laenderinfos', function (req, res) {
  var daten = require('./misc/laenderinfo.json');
  res.send(daten);
});


app.use('/api', router);
