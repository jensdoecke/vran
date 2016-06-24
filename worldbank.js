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

cache = {};

connection.connect();


  var request = require('request');

module.exports = {
  fetchAll: function(){
    // connection.query("CREATE TABLE worldbank(country STRING, indicator STRING, rawValue DECIMAL(20,15))");
    connection.query("TRUNCATE worldbank");
    // connection.query("CREATE TABLE worldbank_score(country STRING, indicator STRING, rawValue DECIMAL(20,15), score DECIMAL(20,15))");
    connection.query("TRUNCATE worldbank_score");
    fetchRequest('NY.GDP.MKTP.KD.ZG', 3);
    fetchRequest('PV.EST', 1);
    fetchRequest('GC.BAL.CASH.GD.ZS', 1);
    fetchRequest('LP.EXP.DURS.MD', 1);
    fetchRequest('IC.IMP.DOCS', 1);
    fetchRequest('IC.IMP.COST.CD', 1);
    fetchRequest('IC.EXP.DOCS', 1);
    fetchRequest('IC.EXP.COST.CD', 1);
    fetchRequest('LP.IMP.DURS.MD', 1);
    fetchRequest('NY.GDP.PCAP.PP.KD', 1);
    fetchRequest('SL.UEM.TOTL.ZS', 1);
    fetchRequest('LP.LPI.OVRL.XQ', 1);
    fetchRequest('IC.BUS.EASE.XQ', 1);
    fetchRequest('IT.NET.USER.P2', 1);
    fetchRequest('SL.GDP.PCAP.EM.KD', 1);
    fetchRequest('SH.DTH.COMM.ZS', 1);
    fetchRequest('SH.DTH.INJR.ZS', 1);
  }
  ,
  selectAll(res){
    res.send(cache);

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
    connection.query(sqlStmt, function (err){
      console.log("aggregieren");
      var sqls = "SELECT country, 1*(1*(SELECT AVG(T.score) FROM worldbank_score as T WHERE T.country=worldbank_score.country AND T.indicator='PV.EST' GROUP BY T.indicator)+0) AS politische_lage, 0.5*(1*(SELECT AVG(T.score) FROM worldbank_score as T WHERE T.country=worldbank_score.country AND T.indicator='NY.GDP.MKTP.KD.ZG' GROUP BY T.indicator)+0)+0.3*(-1*(SELECT AVG(T.score) FROM worldbank_score as T WHERE T.country=worldbank_score.country AND T.indicator='SL.UEM.TOTL.ZS' GROUP BY T.indicator)+100)+0.2*(-1*(SELECT AVG(T.score) FROM worldbank_score as T WHERE T.country=worldbank_score.country AND T.indicator='GC.BAL.CASH.GD.ZS' GROUP BY T.indicator)+100) AS wirtschaftliche_lage, 0.7*(1*(SELECT AVG(T.score) FROM worldbank_score as T WHERE T.country=worldbank_score.country AND T.indicator='NY.GDP.PCAP.PP.KD' GROUP BY T.indicator)+0)+0.3*(-1*(SELECT AVG(T.score) FROM worldbank_score as T WHERE T.country=worldbank_score.country AND T.indicator='SL.UEM.TOTL.ZS' GROUP BY T.indicator)+100) AS export_kaufkraft, 0.5*(-1*(SELECT AVG(T.score) FROM worldbank_score as T WHERE T.country=worldbank_score.country AND T.indicator='IC.IMP.DOCS' GROUP BY T.indicator)+100)+0.5*(-1*(SELECT AVG(T.score) FROM worldbank_score as T WHERE T.country=worldbank_score.country AND T.indicator='IC.IMP.COST.CD' GROUP BY T.indicator)+100) AS export_einfuhrbestimmungen, 1*(1*(SELECT AVG(T.score) FROM worldbank_score as T WHERE T.country=worldbank_score.country AND T.indicator='LP.LPI.OVRL.XQ' GROUP BY T.indicator)+0) AS export_logistikanbindung, 0.5*(-1*(SELECT AVG(T.score) FROM worldbank_score as T WHERE T.country=worldbank_score.country AND T.indicator='IC.EXP.DOCS' GROUP BY T.indicator)+100)+0.5*(-1*(SELECT AVG(T.score) FROM worldbank_score as T WHERE T.country=worldbank_score.country AND T.indicator='IC.EXP.COST.CD' GROUP BY T.indicator)+100) AS import_ausfuhrbestimmung, 0.7*(-1*(SELECT AVG(T.score) FROM worldbank_score as T WHERE T.country=worldbank_score.country AND T.indicator='NY.GDP.PCAP.PP.KD' GROUP BY T.indicator)+100)+0.3*(1*(SELECT AVG(T.score) FROM worldbank_score as T WHERE T.country=worldbank_score.country AND T.indicator='SL.UEM.TOTL.ZS' GROUP BY T.indicator)+0) AS import_preisniveau, 1*(1*(SELECT AVG(T.score) FROM worldbank_score as T WHERE T.country=worldbank_score.country AND T.indicator='LP.LPI.OVRL.XQ' GROUP BY T.indicator)+0) AS import_logistikanbindung, 0.4*(-1*(SELECT AVG(T.score) FROM worldbank_score as T WHERE T.country=worldbank_score.country AND T.indicator='IC.BUS.EASE.XQ' GROUP BY T.indicator)+100)+0.2*(1*(SELECT AVG(T.score) FROM worldbank_score as T WHERE T.country=worldbank_score.country AND T.indicator='IT.NET.USER.P2' GROUP BY T.indicator)+0)+0.4*(1*(SELECT AVG(T.score) FROM worldbank_score as T WHERE T.country=worldbank_score.country AND T.indicator='LP.LPI.OVRL.XQ' GROUP BY T.indicator)+0) AS produktionsstaette_infrastruktur, 0.3*(1*(SELECT AVG(T.score) FROM worldbank_score as T WHERE T.country=worldbank_score.country AND T.indicator='SL.UEM.TOTL.ZS' GROUP BY T.indicator)+0)+0.7*(-1*(SELECT AVG(T.score) FROM worldbank_score as T WHERE T.country=worldbank_score.country AND T.indicator='SL.GDP.PCAP.EM.KD' GROUP BY T.indicator)+100) AS produktionsstaette_lohnniveau, 0.5*(-1*(SELECT AVG(T.score) FROM worldbank_score as T WHERE T.country=worldbank_score.country AND T.indicator='SH.DTH.COMM.ZS' GROUP BY T.indicator)+100)+0.5*(-1*(SELECT AVG(T.score) FROM worldbank_score as T WHERE T.country=worldbank_score.country AND T.indicator='SH.DTH.INJR.ZS' GROUP BY T.indicator)+100) AS produktionsstaette_umwelteinfluesse FROM worldbank_score";
      connection.query(sqls,
      function(err, rows, fields) {
        console.log("selektieren");
        for(idx in rows){
          var row = rows[idx];
          cache[row.country] = {
            'politische_lage':row.politische_lage,
            'wirtschaftliche_lage':row.wirtschaftliche_lage,
            'export_kaufkraft':row.export_kaufkraft,
            'export_einfuhrbestimmungen':row.export_einfuhrbestimmungen,
            'export_logistikanbindung':row.export_logistikanbindung,
            'import_ausfuhrbestimmung':row.import_ausfuhrbestimmung,
            'import_preisniveau':row.import_preisniveau,
            'import_logistikanbindung':row.import_logistikanbindung,
            'produktionsstaette_infrastruktur':row.produktionsstaette_infrastruktur,
            'produktionsstaette_lohnniveau':row.produktionsstaette_lohnniveau,
            'produktionsstaette_umwelteinfluesse':row.produktionsstaette_umwelteinfluesse
          };
        }
        connection.end();
      }
      );
    });
}

function fetchRequest(indicator, mrv){
  var url = 'http://api.worldbank.org/countries/all/indicators/' + indicator + '?format=json&MRV='+mrv+'&per_page=1000';
  var data = 'empty';
  request(url, function (error, response, body) {
      if (!error && response.statusCode == 200) {

          insertIndicator(JSON.parse(body));
          count++;
          if(count > 16){
            aggregateData();
          }
      }
  })
}
