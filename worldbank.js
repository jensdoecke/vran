
  var alasql = require('alasql');

  var request = require('request');

module.exports = {
  fetchAll: function(){
    alasql("CREATE TABLE worldbank(country STRING, indicator STRING, rawValue DECIMAL(20,15))");
    fetchRequest('NY.GDP.MKTP.KD.ZG');
    fetchRequest('PV.EST');
    fetchRequest('GC.BAL.CASH.GD.ZS');
    fetchRequest('LP.EXP.DURS.MD');
    fetchRequest('IC.IMP.DOCS');
    fetchRequest('IC.IMP.COST.CD');
    fetchRequest('LP.IMP.DURS.MD');
    fetchRequest('NY.GDP.PCAP.PP.KD');
    fetchRequest('SL.UEM.TOTL.ZS');
    fetchRequest('LP.LPI.OVRL.XQ');
    fetchRequest('IC.BUS.EASE.XQ');
    fetchRequest('IT.NET.USER.P2');
    fetchRequest('SL.GDP.PCAP.EM.KD');
    fetchRequest('SH.DTH.COMM.ZS');
    fetchRequest('SH.DTH.INJR.ZS');
  }
  ,
  selectAll(){
    return alasql("SELECT distinct(indicator) FROM worldbank");
    // return alasql("SELECT country, avg(rawValue) as avg_rawValue FROM worldbank group by country");
  }
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
}

function fetchRequest(indicator){

  var url = 'http://api.worldbank.org/countries/all/indicators/' + indicator + '?format=json&MRV=3&per_page=1000';
console.log(url);
  var data = 'empty';
  request(url, function (error, response, body) {
      if (!error && response.statusCode == 200) {
          enrich(JSON.parse(body));
      }
  })
}
