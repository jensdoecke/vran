var mysql = require('mysql');
var count = 0;
var connection = mysql.createConnection(
    {
      host     : 'brandenburgische-wanderfreunde.de',
      user     : 'd014e7ac',
      password : 'hackathon',
      database : 'd014e7ac',
    }
);

connection.connect();


  var request = require('request');

module.exports = {
  fetchAll: function(){
    // connection.query("CREATE TABLE worldbank(country STRING, indicator STRING, rawValue DECIMAL(20,15))");
    // connection.query("TRUNCATE worldbank");
    // connection.query("CREATE TABLE worldbank_score(country STRING, indicator STRING, rawValue DECIMAL(20,15), score DECIMAL(20,15))");
    // connection.query("TRUNCATE worldbank_score");
    // fetchRequest('NY.GDP.MKTP.KD.ZG', 3);
    // fetchRequest('PV.EST', 1);
    // fetchRequest('GC.BAL.CASH.GD.ZS', 1);
    // fetchRequest('LP.EXP.DURS.MD', 1);
    // fetchRequest('IC.IMP.DOCS', 1);
    // fetchRequest('IC.IMP.COST.CD', 1);
    // fetchRequest('LP.IMP.DURS.MD', 1);
    // fetchRequest('NY.GDP.PCAP.PP.KD', 1);
    // fetchRequest('SL.UEM.TOTL.ZS', 1);
    // fetchRequest('LP.LPI.OVRL.XQ', 1);
    // fetchRequest('IC.BUS.EASE.XQ', 1);
    // fetchRequest('IT.NET.USER.P2', 1);
    // fetchRequest('SL.GDP.PCAP.EM.KD', 1);
    // fetchRequest('SH.DTH.COMM.ZS', 1);
    // fetchRequest('SH.DTH.INJR.ZS', 1);
  }
  ,
  selectAll(){
    return connection.query("SELECT * FROM worldbank_score");
  }
}


function insertIndicator(body)
{
  var values = [];
  for(idx in body[1])
  {
    var row = [body[1][idx].indicator.id, body[1][idx].country.id, body[1][idx].value];
    values.push(row);
  }
  connection.query("INSERT INTO worldbank(indicator, country, rawValue) VALUES ?", [values]);
}

function aggregateData(){
    var sqlStmt = "insert into worldbank_score(country, indicator, rawValue, score) " +
    "SELECT T.country, T.indicator, T.rawValue, "+
    "IF( T.rawValue is not NULL,100-(SELECT count(*) FROM worldbank " +
    "WHERE worldbank.indicator=T.indicator AND  (worldbank.rawValue > T.rawValue "+
    "and worldbank.rawValue is not NULL) )*100/(select count(*) FROM worldbank "+
    "WHERE worldbank.indicator=T.indicator and worldbank.rawValue is not NULL),NULL) as score "+
    "FROM worldbank as T";
    connection.query(sqlStmt);
}

function fetchRequest(indicator, mrv){
  var url = 'http://api.worldbank.org/countries/all/indicators/' + indicator + '?format=json&MRV='+mrv+'&per_page=1000';
  var data = 'empty';
  request(url, function (error, response, body) {
      if (!error && response.statusCode == 200) {

          insertIndicator(JSON.parse(body));
          count++;
          if(count >= 14){
            aggregateData();
          }
      }
  })
}
