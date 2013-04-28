
/**
 * Module dependencies.
 */

var express = require('express')
  , everyauth = require('everyauth')
  , routes = require('./routes')
  , feeds = require('./routes/feeds')
  , articles = require('./routes/articles')
  , http = require('http')
  , path = require('path');

var app = express();

var basicAuth = express.basicAuth(function(user, pass) {
  return 'carsten' == user && 'password' == pass;
});

// all environments
app.set('port', process.env.PORT || 4000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.cookieParser('your secret here'));
app.use(express.session());
app.use(app.router);
app.use(require('less-middleware')({ src: __dirname + '/public' }));
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);
app.get('/feeds', basicAuth, feeds.list);
app.post('/feeds', basicAuth, feeds.add);
app.get('/feeds/:id', basicAuth, feeds.show);
app.delete('/feeds/:id', basicAuth, feeds.delete);
app.get('/articles', basicAuth, articles.list);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
