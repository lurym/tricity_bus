var http = require('http');
var express = require('express');
var iconv = require('iconv-lite');

/* SERVER INITIALIZATION */
var app = express();
var server_port = process.env.OPENSHIFT_NODEJS_PORT || 1180;
var server_ip_address = process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0';

app.use(express.static(__dirname + '/public'));
app.get('/', onRequest);
app.listen(server_port, server_ip_address, function () {
    console.log( "Listening on " + server_ip_address + ", server_port " + server_port )
});

/* CONSTANTS */
var DOM_BRETOWO = {'stop': 'Kierunek: Brętowo', 'url': 'http://www.ztm.gda.pl/rozklady/pobierz_SIP.php?n[0]=1371&t=&l=210'};
var DOM_CENTRUM = {'stop': 'Kierunek: Centrum', 'url': 'http://www.ztm.gda.pl/rozklady/pobierz_SIP.php?n[0]=1374&t=&l=210'};
var PRACA = {'stop': 'Intel', 'url': 'http://www.ztm.gda.pl/rozklady/pobierz_SIP.php?n[0]=1404&t=&l=210'};
var HTML = '<html><head>\
<link href="./style.css" rel="stylesheet" type="text/css">\
</head><body>{0}</body></html>';

/* UTILS*/
String.format = function(format) {
	var args = Array.prototype.slice.call(arguments, 1);
	return format.replace(/{(\d+)}/g, function(match, number) { 
		return typeof args[number] != 'undefined'
			? args[number] 
			: match;
	});
};

function reduceResponses(res, responses) {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
	output = String.format(HTML, responses.join('</div>'));
    console.log("Request handled successfully");
	res.end(output);
}

function makeSingleRequest(url, callback) {
    console.log(url);
    http.get(url, function (resp) {
        var chunks = [];
        resp.on('data', function(chunk) {
			decodedStr = iconv.decode(chunk, 'iso-8859-2');
            chunks.push(decodedStr);
        });
        resp.on('end', function() {
            singleResponse = chunks.join();
            callback(singleResponse);
        });
    });
}

function makeMultipleRequests(urls, res) {
    var requestsFinished = 0;
    var responses = [];
    urls.forEach(function(url) {
        makeSingleRequest(url['url'], function(singleResponse) {
            responses.push('<h1>' + url['stop'] + '</h1>' + singleResponse);
            requestsFinished++;
            if (requestsFinished == urls.length) {
                reduceResponses(res, responses);
             }
        });
    });
}

/* REQUEST HANDLER */
function onRequest(req, res) {
  console.log('Request retrieved ' + req.url);
  if (req.url === '/') {
    makeMultipleRequests([DOM_CENTRUM, DOM_BRETOWO, PRACA], res);
  }
  else {
	res.writeHead(404);
    res.end();
  }
}

