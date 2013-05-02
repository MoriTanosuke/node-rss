var mongo = require('mongodb')
  , BSON = mongo.BSONPure;

var mongoUri = process.env.MONGOLAB_URI || process.env.MONGOHQ_URL || 'mongodb://localhost/mydb';

/*
 * connect to DB
 */
var connect = function(fn) {
  // TODO why isn't this accepting safe: false?
  mongo.Db.connect(mongoUri, {safe: false}, fn);
}

/*
 * create collection 'feeds'
 */
connect(function (err, db) {
  db.createCollection('feeds', function(err, collection) {
    if(err) console.log(err);
    console.log('Collection "feeds" created.');
  });
});
/*
 * create collection 'articles'
 */
connect(function (err, db) {
  db.createCollection('articles', function(err, collection) {
    if(err) console.log(err);
    console.log('Collection "articles" created.');
  });
});

/*
 * Query DB for feeds
 */
exports.feeds = function(fn) {
  connect(function(err, db) {
    db.collection('feeds', fn);
  });
};

/*
 * Query DB for articles
 */
exports.articles = function(fn) {
  connect(function(err, db) {
    db.collection('articles', fn);
  });
};

/*
 * Create new BSON ObjectID from given string
 */
exports.ID = function(id) {
  return new BSON.ObjectID(id);
};

