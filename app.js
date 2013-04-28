
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , feeds = require('./routes/feeds')
  , articles = require('./routes/articles')
  , http = require('http')
  , path = require('path');

var app = express();

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
app.get('/feeds', feeds.list);
app.post('/feeds', feeds.add);
app.get('/feeds/:id', feeds.show);
app.delete('/feeds/:id', feeds.delete);
app.get('/articles', articles.list);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
