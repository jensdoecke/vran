
var db = require('./database');
var request = require('request');
var indicatorCount = 0;
var requiredIndicators = [
    { indicator: 'NY.GDP.MKTP.KD.ZG', mrv: 3},
    { indicator: 'PV.EST'           , mrv: 1},
    { indicator: 'GC.BAL.CASH.GD.ZS', mrv: 1},
    { indicator: 'LP.EXP.DURS.MD'   , mrv: 1},
    { indicator: 'IC.IMP.DOCS'      , mrv: 1},
    { indicator: 'IC.IMP.COST.CD'   , mrv: 1},
    { indicator: 'IC.EXP.DOCS'      , mrv: 1},
    { indicator: 'IC.EXP.COST.CD'   , mrv: 1},
    { indicator: 'LP.IMP.DURS.MD'   , mrv: 1},
    { indicator: 'NY.GDP.PCAP.PP.KD', mrv: 1},
    { indicator: 'SL.UEM.TOTL.ZS'   , mrv: 1},
    { indicator: 'LP.LPI.OVRL.XQ'   , mrv: 1},
    { indicator: 'IC.BUS.EASE.XQ'   , mrv: 1},
    { indicator: 'IT.NET.USER.P2'   , mrv: 1},
    { indicator: 'SL.GDP.PCAP.EM.KD', mrv: 1},
    { indicator: 'SH.DTH.COMM.ZS'   , mrv: 1},
    { indicator: 'SH.DTH.INJR.ZS'   , mrv: 1}
  ];



module.exports = {
  initDb: function(){
    // db.getClient().query("CREATE TABLE worldbank(country STRING, indicator STRING, rawValue DECIMAL(20,15))");
    db.getClient().query("TRUNCATE worldbank");
    // db.getClient().query("CREATE TABLE worldbank_score(country STRING, indicator STRING, rawValue DECIMAL(20,15), score DECIMAL(20,15))");
    db.getClient().query("TRUNCATE worldbank_score");

    requiredIndicators.forEach(function(reqIndicator){
      fetchRequest(reqIndicator.indicator, reqIndicator.mrv);
    });
  }
  ,
  selectCountries: function(res){
    var sqlStmt = "SELECT T.country, 1*(1*T.`PV.EST`+0) AS politische_lage, 0.5*(1*T.`NY.GDP.MKTP.KD.ZG`+0)+0.3*(-1*T.`SL.UEM.TOTL.ZS`+100)+0.2*(-1*T.`GC.BAL.CASH.GD.ZS`+100) AS wirtschaftliche_lage, 0.7*(1*T.`NY.GDP.PCAP.PP.KD`+0)+0.3*(-1*T.`SL.UEM.TOTL.ZS`+100) AS export_kaufkraft, 0.5*(-1*T.`IC.IMP.DOCS`+100)+0.5*(-1*T.`IC.IMP.COST.CD`+100) AS export_einfuhrbestimmungen, 1*(1*T.`LP.LPI.OVRL.XQ`+0) AS export_logistikanbindung, 0.5*(-1*T.`IC.EXP.DOCS`+100)+0.5*(-1*T.`IC.EXP.COST.CD`+100) AS import_ausfuhrbestimmung, 0.7*(-1*T.`NY.GDP.PCAP.PP.KD`+100)+0.3*(1*T.`SL.UEM.TOTL.ZS`+0) AS import_preisniveau, 1*(1*T.`LP.LPI.OVRL.XQ`+0) AS import_logistikanbindung, 0.4*(-1*T.`IC.BUS.EASE.XQ`+100)+0.2*(1*T.`IT.NET.USER.P2`+0)+0.4*(1*T.`LP.LPI.OVRL.XQ`+0) AS produktionsstaette_infrastruktur, 0.3*(1*T.`SL.UEM.TOTL.ZS`+0)+0.7*(-1*T.`SL.GDP.PCAP.EM.KD`+100) AS produktionsstaette_lohnniveau, 0.5*(-1*T.`SH.DTH.COMM.ZS`+100)+0.5*(-1*T.`SH.DTH.INJR.ZS`+100) AS produktionsstaette_umwelteinfluesse FROM (SELECT `country`,MAX(IF(`indicator` = 'PV.EST', `score`, NULL)) AS 'PV.EST',MAX(IF(`indicator` = 'NY.GDP.MKTP.KD.ZG', `score`, NULL)) AS 'NY.GDP.MKTP.KD.ZG',MAX(IF(`indicator` = 'SL.UEM.TOTL.ZS', `score`, NULL)) AS 'SL.UEM.TOTL.ZS',MAX(IF(`indicator` = 'GC.BAL.CASH.GD.ZS', `score`, NULL)) AS 'GC.BAL.CASH.GD.ZS',MAX(IF(`indicator` = 'NY.GDP.PCAP.PP.KD', `score`, NULL)) AS 'NY.GDP.PCAP.PP.KD',MAX(IF(`indicator` = 'IC.IMP.DOCS', `score`, NULL)) AS 'IC.IMP.DOCS',MAX(IF(`indicator` = 'IC.IMP.COST.CD', `score`, NULL)) AS 'IC.IMP.COST.CD',MAX(IF(`indicator` = 'LP.LPI.OVRL.XQ', `score`, NULL)) AS 'LP.LPI.OVRL.XQ',MAX(IF(`indicator` = 'IC.EXP.DOCS', `score`, NULL)) AS 'IC.EXP.DOCS',MAX(IF(`indicator` = 'IC.EXP.COST.CD', `score`, NULL)) AS 'IC.EXP.COST.CD',MAX(IF(`indicator` = 'IC.BUS.EASE.XQ', `score`, NULL)) AS 'IC.BUS.EASE.XQ',MAX(IF(`indicator` = 'IT.NET.USER.P2', `score`, NULL)) AS 'IT.NET.USER.P2',MAX(IF(`indicator` = 'SL.GDP.PCAP.EM.KD', `score`, NULL)) AS 'SL.GDP.PCAP.EM.KD',MAX(IF(`indicator` = 'SH.DTH.COMM.ZS', `score`, NULL)) AS 'SH.DTH.COMM.ZS',MAX(IF(`indicator` = 'SH.DTH.INJR.ZS', `score`, NULL)) AS 'SH.DTH.INJR.ZS'  FROM worldbank_score GROUP BY  `country`) AS T";
    db.getClient().query(sqlStmt,
      function(err, rows, fields) {
        if(err)
        {
          res.send({error: "Fehler bei der Länderselektion."});
          return;
        }

        var jsonResult = {};
        rows.forEach(function(row){
          jsonResult[row.country] = mapResultToJson(row);
        });
        res.send(jsonResult);

      });
  }
}

function mapResultToJson(row){
  var json = {
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
  }
  return json;
}


function insertIndicator(body)
{
  var insertValues = [];
  var rows = body[1];
  rows.forEach(function(row){
    var indicator = [ row.indicator.id,
                      row.country.id,
                      row.value];
    insertValues.push(indicator);
  });
  db.getClient().query("INSERT INTO worldbank(indicator, country, rawValue) VALUES ?", [insertValues]);
}

function enrichIndicatorsWithScore(){
    var sqlStmt = "insert into worldbank_score(country, indicator, rawValue, score) " +
    "SELECT T.country, T.indicator, T.rawValue, "+
    "IF( T.rawValue is not NULL,100-(SELECT count(*) FROM worldbank " +
    "WHERE worldbank.indicator=T.indicator AND  (worldbank.rawValue > T.rawValue "+
    "and worldbank.rawValue is not NULL) )*100/(select count(*) FROM worldbank "+
    "WHERE worldbank.indicator=T.indicator and worldbank.rawValue is not NULL),NULL) as score "+
    "FROM worldbank as T";
    db.getClient().query(sqlStmt);
}

function fetchRequest(indicator, mrv){
  var url = 'http://api.worldbank.org/countries/all/indicators/' + indicator + '?format=json&MRV='+mrv+'&per_page=1000';
  request(url, function (error, response, body) {
      if (!error && response.statusCode == 200) {
          insertIndicator(JSON.parse(body));
          indicatorCount++;
          if(indicatorCount >= requiredIndicators.length){
            enrichIndicatorsWithScore();
          }
      }
  })
}
