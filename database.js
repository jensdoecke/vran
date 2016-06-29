var mysql = require('mysql');

var client = mysql.createConnection(
    {
      host     : 'brandenburgische-wanderfreunde.de',
      user     : 'd014e7ac',
      password : 'hackathon',
      database : 'd014e7ac',
    }
);


function replaceClientOnDisconnect(client) {
  client.on("error", function (err) {
    if (!err.fatal) {
      return;
    }

    if (err.code !== "PROTOCOL_CONNECTION_LOST") {
      throw err;
    }

    client = mysql.createConnection(client.config);
    replaceClientOnDisconnect(client);
    client.connect(function (error) {
      if (error) {
        process.exit(1);
      }
    });
  });
}

replaceClientOnDisconnect(client);

exports.getClient = function () {
  return client;
};
