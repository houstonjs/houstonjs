var connect = require("connect");
var fs = require("fs");
var parse = require("url").parse;
var join = require("path").join;

var app = connect();

function logger(req, res, next) {
  console.log("%s %s", req.method, req.url);
  next();
}

function errorHandler(err, req, res, next) {
  console.log("ERROR!");
  res.statusCode = 500;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(err));
}

app.use(logger);
app.use(connect.static(__dirname + "/build"))
app.use(errorHandler);
app.listen(3000);
