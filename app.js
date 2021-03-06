var express = require('express');
var app = express();
var router = express.Router();
var worldbank = require('./worldbank');
app.use(express.static(__dirname + '/public'));

var cfenv = require('cfenv');
var appEnv = cfenv.getAppEnv();

/*app.listen(6001, '0.0.0.0', function () {
  console.log('server starting');
  worldbank.initDb();
});*/
app.listen(appEnv.port, '0.0.0.0', function() {
  console.log("server starting on " + appEnv.url);
  worldbank.initDb();
});

router.get('/reloadworldbank', function (req, res) {
  worldbank.selectCountries(res);
});

router.get('/countries', function (req, res) {
  var daten = require('./misc/worldbank.json');
  //worldbank.selectCountries(res);
  res.send(daten);
});

router.get('/laenderinfos', function (req, res) {
  var daten = require('./misc/laenderinfo.json');
  res.send(daten);
});

router.get('/oldcountries', function (req, res) {
  var daten = require('./misc/daten.json');
  res.send(daten);
});

router.get('/waehrungen', function(req,res) {
  var daten = require('./misc/Waehrungen.json');
  res.send(daten);
});
//
router.get('/exchangerates', function(req,res) {
  var daten = require('./misc/exchangerates.json');
  var laender = require('./misc/Waehrungen.json');
  var d = new Date();
  var n = d.getTime();
  if ((daten == null) || (Math.round(n/1000) - daten.timestamp > 86400)) {
    var request = require('request');
    var url = 'https://openexchangerates.org/api/latest.json?app_id=cc8e8a1f1a014c9faacfbc107e37bbcf';
    request(url,function(error,response,body) {
      if(!error && response.statusCode == 200) {
	  daten = JSON.parse(body);
	  var fs  = require('fs');
	  fs.writeFile('./misc/exchangerates.json', JSON.stringify(daten, null, 4), (err) => {
	    if (err) throw err;
	    console.log('Währungskurse neu geladen!');
	  });
      }
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

/*setInterval( function() {
  auto update of worldbank data!  
}, 864000000);*/
