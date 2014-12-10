'use strict';
var express = require('express');
var path = require('path');
var logger = require('morgan');
var bodyParser = require('body-parser');
var expressValidator = require('express-validator');
var passwordless = require('passwordless');
var MongoStore = require('passwordless-mongostore');
var email = require('emailjs');

var auth = require('./routes/auth');

var credentials = require('./credentials');

var smtpServer = email.server.connect(credentials.email);
passwordless.init(new MongoStore(credentials.passwordless));

passwordless.addDelivery(
  function (tokenToSend, uidToSend, recipient, callback) {
    smtpServer.send({
      text: 'token: ' + tokenToSend + '\nuid: ' +
      encodeURIComponent(uidToSend),
      from: credentials.email.user,
      to: recipient,
      subject: 'Token to Icarus service'
    }, function (err, message) {
      if (err) {
        console.log(err, message);
      }
      callback(err);
    });
  }, {ttl: 1000 * 60 * 24 * 7});

var app = express();

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(expressValidator());
expressValidator.validator.extend('toLowerCase',
  function (str) {
    return str.toLowerCase();
  }
);
app.use(passwordless.acceptToken());

app.use('/', express.static(path.join(__dirname, 'public')));
app.use('/', auth);
app.use('/panel', passwordless.restricted(),
  express.static(path.join(__dirname, 'public/panel')));

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function (err, req, res) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

module.exports = app;
