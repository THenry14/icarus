'use strict';
var express = require('express');
var router = express.Router();
var passwordless = require('passwordless');

var User = require('../models/user');

router.post('/reqtoken',
  function (req, res, next) {
    req.checkBody('email', 'Invalid email').isLength(1, 200).isEmail();
    req.sanitize('email').toLowerCase().trim();

    var errors = req.validationErrors();
    if (errors) {
      res.json(errors);
      return;
    }
    next();
  },
  passwordless.requestToken(
    function (email, delivery, callback) {
      User.findOne({email: email}, function (err, user) {
        if (err) {
          callback(err.toString());
        }
        else if (user) {
          callback(null, user.id);
        }
      });
      var newUser = new User({email: email});
      newUser.save(function (err) {
        if (err) {
          console.log(err);
          callback(err.toString());
        } else {
          callback(null, user);
          console.log('New user');
        }
      });
    }
  ),
  function (req, res) {
    res.json({msg: 'Login success'});
  }
);

module.exports = router;
