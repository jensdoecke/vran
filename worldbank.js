
  var alasql = require('alasql');

  var request = require('request');

module.exports = {
  fetchAll: function(){
    console.log(fetchGDP());
    alasql("CREATE TABLE worldbank(country STRING, indicator STRING, val DECIMAL(20,15))");
    //  alasql("INSERT INTO test VALUES (1,'assad')");
    //  alasql("INSERT INTO test VALUES (2,'Aloha!')");


  }
}

function fetchGDP(){
  var gdp = fetchRequest('NY.GDP.MKTP.KD.ZG');
  return gdp;
}

function enrich(body)
{
  for(idx in body[1])
  {
    indId = body[1][idx].indicator.id;
    countryId = body[1][idx].country.id;
    indValue = body[1][idx].value;
    alasql("INSERT INTO worldbank VALUES ('"+ countryId + "','"+indId+"',"+ indValue + ")");
  }
console.log( alasql("SELECT * FROM worldbank ") );
}

function fetchRequest(indicator){
  var url = 'http://api.worldbank.org/countries/all/indicators/' + indicator + '?format=json&MRV=3&per_page=1000';
  var data = 'empty';
  console.log('before request');
  request(url, function (error, response, body) {
      if (!error && response.statusCode == 200) {
          enrich(JSON.parse(body));
      }
  })

}
