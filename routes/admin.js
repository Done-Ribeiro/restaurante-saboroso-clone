var express = require('express');
var users = require('./../inc/users');
var admin = require('./../inc/admin');
var menus = require('./../inc/menus');
var reservations = require('./../inc/reservations');
var contacts = require('./../inc/contacts');
var emails = require('./../inc/emails');
var moment = require('moment');
var router = express.Router();

moment.locale('pt-BR');

// configurando middleware (nivel de roteador) - autenticacao login,  rota -> '/login'
router.use(function (req, res, next) {
  /**
   * ? o usuario ainda nao está logado, e precisamos deixar ele acessar a rota de login, para poder se logar
   * * ['/login'].indexOf(req.url) -> vai verificar se a rota acessada, eh a de login
   */
  if (['/login'].indexOf(req.url) === -1 && !req.session.user) {// se não for a rota de login (ele nao achou o req.url, dentro do meu array) && a sessao user nao existir
    res.redirect('/admin/login');// redireciona pro login
  } else {
    next();
  }
});

// add um middleware - para passar os menus para todas as rotas de '/admin/'
router.use(function (req, res, next) {
  req.menus = admin.getMenus(req);// passamos o req agora, para poder verificar qual rota esta ativa (com base no req.url)
  next();
});

// LOGOUT
router.get('/logout', function (req, res, next) {
  delete req.session.user;// apagar o usuario da sessao
  res.redirect('/admin/login');
});

router.get('/', function (req, res, next) {
  admin.dashboard().then(data => {
    res.render('admin/index', admin.getParams(req, {
      data
    }));
  }).catch(err => {
    console.error(err);
  });
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
  contacts.getContacts().then(data => {
    res.render('admin/contacts', admin.getParams(req, {
      data
    }));
  });
});

router.delete('/contacts/:id', function (req, res, next) {
  contacts.delete(req.params.id).then(results => {
    res.send(results);
  }).catch(err => {
    res.send(err);
  });
});

router.get('/emails', function (req, res, next) {
  emails.getEmails().then(data => {
    res.render('admin/emails', admin.getParams(req, {
      data
    }));
  });
});

router.delete('/emails/:id', function (req, res, next) {
  emails.delete(req.params.id).then(results => {
    res.send(results);
  }).catch(err => {
    res.send(err);
  });
});

router.get('/menus', function (req, res, next) {
  menus.getMenus().then(data => {
    res.render('admin/menus', admin.getParams(req, {
      data
    }));
  });
});

router.post('/menus', function (req, res, next) {
  menus.save(req.fields, req.files).then(results => {
    res.send(results);
  }).catch(err => {
    res.send(err);
  });
});

router.delete('/menus/:id', function (req, res, next) {// :id -> recebe um numero, e guarda dentro da variavel id
  menus.delete(req.params.id).then(results => {
    res.send(results);
  }).catch(err => {
    res.send(err);
  });
})

router.get('/reservations', function (req, res, next) {

  let start = (req.query.start) ? req.query.start : moment().subtract(1, 'year').format('YYYY-MM-DD');// se nao tiver data inicial, volta exatamente 1 ano, a partir de hj
  let end = (req.query.end) ? req.query.end : moment().format('YYYY-MM-DD');// se nao foi passado data final, passa a data atual

  reservations.getReservations(
    req// agora passamos somente o req, pq mudou a implementacao
  ).then(pag => {
    res.render('admin/reservations', admin.getParams(req, {
      date: {
        start,
        end
      },
      data: pag.data,
      moment,
      links: pag.links
    }));
  });
});

router.get('/reservations/chart', function (req, res, next) {
  // precisamos formatar as datas (inicial, final), vamos sobreescrever as variaveis
  req.query.start = (req.query.start) ? req.query.start : moment().subtract(1, 'year').format('YYYY-MM-DD');// se nao tiver data inicial, volta exatamente 1 ano, a partir de hj
  req.query.end = (req.query.end) ? req.query.end : moment().format('YYYY-MM-DD');// se nao foi passado data final, passa a data atual

  reservations.chart(req).then(chartData => {
    res.send(chartData);
  });
});

router.post('/reservations', function (req, res, next) {
  reservations.save(req.fields, req.files).then(results => {
    res.send(results);
  }).catch(err => {
    res.send(err);
  });
});

router.delete('/reservations/:id', function (req, res, next) {
  reservations.delete(req.params.id).then(results => {
    res.send(results);
  }).catch(err => {
    res.send(err);
  });
})

router.get('/users', function (req, res, next) {
  users.getUsers().then(data => {
    res.render('admin/users', admin.getParams(req, {
      data
    }));
  });
});

router.post('/users', function (req, res, next) {
  users.save(req.fields).then(results => {
    res.send(results);
  }).catch(err => {
    res.send(err);
  });
});

router.post('/users/password-change', function (req, res, next) {
  users.changePassword(req).then(results => {
    res.send(results);
  }).catch(err => {
    res.send({
      error: err
    });
  });
});

router.delete('/users/:id', function (req, res, next) {
  users.delete(req.params.id).then(results => {
    res.send(results);
  }).catch(err => {
    res.send(err);
  });
});

module.exports = router;