
var mongo = require('mongodb')
  , BSON = mongo.BSONPure;

var mongoUri = process.env.MONGOLAB_URI || process.env.MONGOHQ_URL || 'mongodb://localhost/mydb';
mongo.Db.connect(mongoUri, function (err, db) {
  db.createCollection('articles', function(err, collection) {
    if(err) console.log(err);
    console.log('Collection "articles" created.');
  });
});

/*
 * GET articles
 */
exports.list = function(req, res) {
  mongo.Db.connect(mongoUri, function (err, db) {
    db.collection('articles', function(err, collection) {
      if(err) console.log(err);
      collection.find().toArray(function(err, items) {
        if(err) console.log(err);
        //TODO check accept header
        var articles = new Array();
        for(i in items) {
          articles.push({"title":items[i].title,"description":items[i].description,"pubdate":items[i].pubdate,"id":items[i]._id});
        }
        res.send(articles);
      });
      //TODO send feeds to frontend
      //TODO create nice listing
    });
  });
};

