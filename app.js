
/**
 * Module dependencies.
 */

var express = require('express')
  , everyauth = require('everyauth')
  , db = require('./db')
  , routes = require('./routes')
  , feeds = require('./routes/feeds')
  , articles = require('./routes/articles')
  , http = require('http')
  , path = require('path');

// configuration

var app = express();

var basicAuth = express.basicAuth(function(user, pass) {
  return 'demo' == user && 'demo' == pass;
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
app.use(require('less-middleware')({ src: __dirname + '/public' }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(app.router);

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

// main routes
app.get('/', routes.index);
// feeds
app.get('/feeds', basicAuth, feeds.list);
app.post('/feeds', basicAuth, feeds.add);
app.post('/feeds/update', basicAuth, feeds.update);
app.get('/feeds/:id', basicAuth, feeds.show);
app.delete('/feeds/:id', basicAuth, feeds.delete);
app.post('/feeds/delete/:id', basicAuth, feeds.delete);
// articles
app.get('/articles', basicAuth, articles.list);
// default catch-all
app.all('*', function(req, res) {
  res.redirect('/');
});

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
