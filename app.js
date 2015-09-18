// env
var maxJsonSize = process.env.MAX_JSON_SIZE ?
      parseInt(process.env.MAX_JSON_SIZE, 10) : 1024 * 10; // 10KB by default

var express = require('express');
var path = require('path');
var json = require('body-parser').json({ limit: maxJsonSize });
var logger = require('morgan');
var debug = require('debug')('clickberry:metadata:api');

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

app.use(json);

app.use('/', api);

// error handlers
app.use(routes.notfound);
app.use(routes.error);

module.exports = app;
