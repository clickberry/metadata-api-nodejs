var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var logger = require('morgan');

var routes = require('./routes');
var api = require('./routes/api');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// logger
if (app.get('env') === 'development') {
  app.use(logger('dev'));
} else {
  app.use(logger());
}

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/', api);

// error handlers
app.use(routes.notfound);
app.use(routes.error);

module.exports = app;
