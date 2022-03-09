var express = require('express');
var router = express.Router();

router.get('/', function (req, res, next) {
  res.render('admin/index');
});

router.get('/login', function (req, res, next) {
  /**
   * * agora o middleware vai criar esse objeto session pra gnt, como objeto
   * * vai passar a existir uma chave chamada views
   */
  if (!req.session.views) req.session.views = 0;//? que se ela, nao existir, ela vai ser 0

  console.log("SESSION: ", req.session.views++);

  res.render('admin/login');
});

router.get('/contacts', function (req, res, next) {
  res.render('admin/contacts');
});

router.get('/emails', function (req, res, next) {
  res.render('admin/emails');
});

router.get('/menus', function (req, res, next) {
  res.render('admin/menus');
});

router.get('/reservations', function (req, res, next) {
  res.render('admin/reservations', {
    date: {}
  });
});

router.get('/users', function (req, res, next) {
  res.render('admin/users');
});

module.exports = router;