var express = require('express');
var app = express();
app.use(express.logger());

var sys=require("sys");
var fs=require("fs");

var buf = fs.readFileSync("./index.html");
var content = buf.toString();

app.get('/', function(request, response) {
  response.send(content);
});

var port = process.env.PORT || 5000;
app.listen(port, function() {
  console.log("Listening on " + port);
});
