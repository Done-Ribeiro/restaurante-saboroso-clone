var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var session = require('express-session');
var RedisStore = require('connect-redis')(session);// aqui ja passamos o construtor, passando o session

var formidable = require('formidable');

var http = require('http');// agora, com uso de websocket, precisaremos mexer no http, pois o servidor web, sera criado a partir do http
var socket = require('socket.io');// socket.io
var bodyParser = require('body-parser');//! bugfix - login

var path = require('path');

var app = express();

//! bugfix - login
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

var http = http.Server(app);// sobreescrevendo o próprio http
var io = socket(http);// variavel io vai chamar o socket, encima do mesmo protocolo http, que ele tbm precisa

//! quando tiver uma nova conexao no socket
io.on('connection', function (socket) {
  console.log('Novo usuário conectado');

  // mandamos um evento, quando o cliente estiver conectado
  /**
   * ! se fizermos um emit encima do io, io.emit() => estamos avisando todos os usuarios que estão conectados no websocket
   * * se fizermos um socket.emit() => avisa apenas o usuario, que acabou de se conectar aqui (e nao todos os usuários)
   */
  io.emit('reservations update', {
    date: new Date()// servidor, mandando a data p/ navegador
  })
});

// middleware para formidable
app.use(function (req, res, next) {
  let content_type = req.headers["content-type"];
  if (req.method === 'POST' && content_type.indexOf('multipart/form-data;') > -1) {
    var form = new formidable.IncomingForm({
      uploadDir: path.join(__dirname, '/public/images'),
      keepExtensions: true
    });

    form.parse(req, function (err, fields, files) {
      req.body = fields;
      req.fields = fields;
      req.files = files;

      next();
    });
  } else {
    next();
  }
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

//* configuracao middleware do redis
app.use(session({
  store: new RedisStore({
    host: 'localhost',
    port: 6379
  }),
  secret: 'p@ssw0rd',//! senha que o redis vai usar, para criptografar as informacoes!
  resave: true,// se a sessao expirar, ele recria uma nova
  saveUninitialized: true// se nao usamos a sessao ainda, mas ja queremos deixar salva no banco
}));

app.use(logger('dev'));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/admin', adminRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

//! agora precisamos dizer que o http, esta ouvindo a porta 3000, uma vez que tiramos ele do padrão (que era no app)
http.listen(3000, function () {
  console.log('servidor em execução...');
});