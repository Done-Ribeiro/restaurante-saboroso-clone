var express = require('express');
var users = require('./../inc/users');
var router = express.Router();

router.get('/', function (req, res, next) {
  res.render('admin/index');
});

router.get('/login', function (req, res, next) {
  users.render(req, res, null);
});

router.post('/login', function (req, res, next) {
  if (!req.body.email) {
    users.render(req, res, "Preencha o campo e-mail.");
  } else if (!req.body.password) {
    users.render(req, res, "Preencha o campo senha.");
  } else {
    users.login(req.body.email, req.body.password).then(user => {
      // USUARIO LOGADO
      req.session.user = user;// guardamos as informações do usuario, na session do redis
      res.redirect('/admin');// redireciona para a pagina principal da administracao
    }).catch(err => {
      /**
       *? err.message -> neste caso, o err.message esta vazio (porque ele eh um objeto e o erro está vindo direto como string)
       ** logo, passamos tambem o
       *? err -> que, neste caso, está pegando o erro como string, direto
       *? poderiamos tambem, ter passado o erro direto como um objeto, com { message: "erro..." } dentro
       *? mas desta maneira, ele trata os 2 tipos de erros com o operador -> ||
      */
      users.render(req, res, err.message || err);
    });
  }
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