var DOM_URL = 'http://www.ztm.gda.pl/rozklady/pobierz_SIP.php?n[0]=1371&t=&l=210';
var PRACA_URL = 'http://www.ztm.gda.pl/rozklady/pobierz_SIP.php?n[0]=1404&t=&l=210';

var http = require('http');

var server = http.createServer();

var server_port = process.env.OPENSHIFT_NODEJS_PORT || 1180
var server_ip_address = process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0'

server
  .on('request', onRequest)
  .listen(server_port, server_ip_address, function () {
    console.log( "Listening on " + server_ip_address + ", server_port " + server_port )
});

function doneFilter(stream) {
  console.log('request done');
}

function makeMultipleRequests(urls, res) {
  res.writeHead(200, { 'Content-Type': 'text/html; charset=iso-8859-2' });
  var requestsFinished = 0;
  urls.forEach(function(url) {
    console.log(url);
    http.get(url, function (resp) {
      chunks = [];
      resp.on('data', function(chunk) {
        chunks.push(chunk);
      });
      resp.on('end', function() {
         res.write(Buffer.concat(chunks));
         requestsFinished++;
         if (requestsFinished == urls.length) {
           res.end();
         }
      });
    });
  });
}

function onRequest(req, res) {
  console.log('Request retrieved ' + req.url);
  if (req.url === '/') {
    makeMultipleRequests([DOM_URL, PRACA_URL], res);
  }
  else {
    res.end();
  }
}

