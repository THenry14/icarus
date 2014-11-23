var express = require('express');
var router = express.Router();
var passwordless = require('passwordless');

var users = [
  { id: 1, email: 'dolohow@outlook.com' },
  { id: 2, email: 'alice@example.com' }
];

router.get('/logged_in', passwordless.acceptToken(),
  function(req, res) {
    //res.render('homepage');
    res.send('przyjalem token');
  });

router.post('/sendtoken',
  passwordless.requestToken(
    function(user, delivery, callback) {
      for (var i = users.length - 1; i >= 0; i--) {
        if(users[i].email === user.toLowerCase()) {
          return callback(null, users[i].id);
        }
      }
      callback(null, null);
    }),
  function(req, res) {
    // success!
    res.send('sent');
  });

router.get('/restricted', passwordless.restricted(),
  function(req, res) {
    res.send('jest super');
  });

module.exports = router;
