var express = require('express')
    , http = require('http');
 
var app = express();

var host = 'http://ows10.cloudapp.net';

app.configure(function() {
  app.use(require('morgan')('default'));
  app.use(express.static(__dirname));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
});
 
app.get('*',  function (req, res) {
  var remote = '';
  var contentType = 'application/xml';
  if (req.query.outputFormat) {
    remote = host + req.path + '?outputFormat=text/json&srsname=epsg:4326';
    contentType = 'text/json';
  } else {
    remote = host + req.path;
  }
  http.get(remote, function(wfsRes) {
    var pageData = '';
    wfsRes.setEncoding('utf8');
    wfsRes.on('data', function (chunk) {
      pageData += chunk;
    });
    wfsRes.on('end', function(){
      res.setHeader('Content-Type', contentType);
      res.send(pageData)
    });
  }).on('error', function(e) {
    console.log("Got error: " + e.message);
  });
});

app.put('*', function(req, res){
  var remote = host + req.path;
  var options = {
    host: host,
    port: 80,
    path: req.path,
    method: 'PUT'
  };

  console.log(remote);

  var wfsReq = http.request(options, function(wfsRes) {
    var pageData = '';
    wfsRes.setEncoding('utf8');
    wfsRes.on('data', function (chunk) {
      pageData += chunk;
    });
    wfsRes.on('end', function() {
      res.setHeader('Content-Type', 'text/json');
      res.send(pageData)
    });
  }).on('error', function(e) {
      console.log("Error: " + e.message); 
      console.log(e.stack);
  });

  wfsReq.setHeader('Content-Type', 'text/json');
  console.log(JSON.stringify(req.body));
  wfsReq.write(JSON.stringify(req.body));
  wfsReq.end();
});

 
app.listen(4242);

console.log('listening in port 4242');