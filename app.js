'use strict';
var express = require('express');
var path = require('path');
var logger = require('morgan');
var bodyParser = require('body-parser');

var passwordless = require('passwordless');
var MongoStore = require('passwordless-mongostore');
var email   = require("emailjs");

var router = require('./routes/passwordless');

var credentials = require('./credentials');

var smtpServer  = email.server.connect(credentials.email);
var pathToMongoDb = 'mongodb://localhost/passwordless-simple-mail';
passwordless.init(new MongoStore(pathToMongoDb), { allowTokenReuse: true });

passwordless.addDelivery(
  function(tokenToSend, uidToSend, recipient, callback) {
    var host = 'localhost:3000';
    smtpServer.send({
      text:    'Hello!\nAccess your account here: http://'
      + host + '?token=' + tokenToSend + '&uid='
      + encodeURIComponent(uidToSend),
      from:    credentials.email.user,
      to:      recipient,
      subject: 'Token for ' + host
    }, function(err, message) {
      if(err) {
        console.log(err);
      }
      callback(err);
    });
  }, { ttl: 1000*60*10 });

var app = express();

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use('/', express.static(path.join(__dirname, 'public')));


app.use(passwordless.acceptToken());
app.use('/api', router);
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
