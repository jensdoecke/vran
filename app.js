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


var worldbank = require('./worldbank');

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
  // worldbank.fetchAll();
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
  var daten = require('./misc/worldbank.json');
  res.send(daten);
});

router.get('/worldbank', function(req, res) {
  worldbank.selectAll(res);
});

router.get('/laenderinfos', function (req, res) {
  var daten = require('./misc/laenderinfo.json');
  res.send(daten);
});


router.get('/waehrungen', function(req,res) {
  var daten = require('./misc/Waehrungen.json');
  res.send(daten);
});

router.get('/exchangerates', function(req,res) {
  var daten = require('./misc/exchangerates.json');
  var laender = require('./misc/Waehrungen.json');
  var d = new Date();
  var n = d.getTime();
  //console.log(daten.timestamp);
  //console.log(Math.round(n/1000));
  if (daten == null || Math.round(n/1000) - daten.timestamp > 86400) {
    $https.get('https://openexchangerates.org/api/latest.json?app_id=cc8e8a1f1a014c9faacfbc107e37bbcf').success(function(data) {
      $scope.daten = data;
      var fs  = require('fs');
      fs.unlinkSync('./misc/exchangerates.json');
      fs.writeFile('./misc/exchangerates.json', data, (err) => {
	if (err) throw err;
	console.log('Fehler beim Speichern der Währungskurse!');
      })
    });
  }
  var mapDaten = daten;
  mapDaten.base = 'EUR';
  var base = 1.0/mapDaten.rates['EUR'];
  for (key in mapDaten.rates) {
    mapDaten.rates[key] = mapDaten.rates[key]*base;
  }
  mapDaten.rates['USD'] = base;
  var laenderWechselkurs = {};
  for (key in laender) {
    laenderWechselkurs[key] = { 'exchangeRate' : Math.round(mapDaten.rates[laender[key]]*100)/100 ,'currency' : laender[key] };
    //console.log('Land ' + key + ' ' + laenderWechselkurs[key] );
  }
  res.send(laenderWechselkurs);
});



app.use('/api', router);
