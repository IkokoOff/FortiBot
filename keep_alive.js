var http = require('http');
http.createServer(function (req, res) {
  res.write("FortiBot");
  res.end();
}).listen(8080);
