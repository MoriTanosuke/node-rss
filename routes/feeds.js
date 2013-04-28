var FeedParser = require('feedparser')
  , request = require('request')
  , parsse = require('parsse')
  , mongo = require('mongodb')
  , BSON = mongo.BSONPure;

var mongoUri = process.env.MONGOLAB_URI || process.env.MONGOHQ_URL || 'mongodb://localhost/mydb';
mongo.Db.connect(mongoUri, function (err, db) {
  db.createCollection('feeds', function(err, collection) {
    if(err) console.log(err);
    console.log('Collection "feeds" created.');
  });
  db.createCollection('feeds', function(err, collection) {
    if(err) console.log(err);
    console.log('Collection "feed_articles" created.');
  });
});

/*
 * GET feeds listing
 */
exports.list = function(req, res) {
  //TODO load feeds from mongodb
  mongo.Db.connect(mongoUri, function (err, db) {
    db.collection('feeds', function(err, collection) {
      if(err) console.log(err);
      // TODO make sort order configurable
      collection.find().sort({pubdate: -1}).toArray(function(err, items) {
        if(err) console.log(err);
        var feeds = new Array();
        for(i in items) {
          feeds.push({"title":items[i].title,"pubdate":items[i].pubdate,"link":items[i].link,"author":items[i].author,"favicon":items[i].favicon,"id":items[i]._id});
        }
        res.render('feeds', { title: "Feeds", user: req.user, feeds: feeds });
      });
      //TODO send feeds to frontend
      //TODO create nice listing
    });
  });
};

/*
 * GET a feed
 */
exports.show = function(req, res) {
  var id = req.param('id');
  // TODO read feed from mongodb
  mongo.Db.connect(mongoUri, function (err, db) {
    db.collection('feeds', function(err, collection) {
      if(err) console.log(err);
      collection.findOne({"_id":new BSON.ObjectID(id)}, function(err, item) {
        if(err) console.log(err);
        //TODO send feeds to frontend
        res.send(item);
      });
    });
  });
};

/*
 * DELETE a feed
 */
exports.delete = function(req, res) {
  var id = req.param('id');
  //TODO delete feed from mongodb
  mongo.Db.connect(mongoUri, function (err, db) {
    db.collection('feeds', function(err, collection) {
      if(err) console.log(err);
      collection.remove({'_id':new BSON.ObjectID(id)}, function(err, result) {
        if(err) console.log(err);
        res.send("deleted feed " + id);
      });
    });
  });
};

/*
 * POST a new feed
 */
exports.add = function(req, res) {
  var url = req.param('url');
  // autodiscover feed url
  parsse(url, function(err, url) {
    if(err) {
      console.log(err);
    } else {
      var feedId = -1;
      // read feed for the first time
      request(url)
        .pipe(new FeedParser())
        .on('error', function(err) {
          console.log(err);
        })
        .on('meta', function(meta) {
          //TODO check if feed & create if nonexisting
          mongo.Db.connect(mongoUri, function (err, db) {
            db.collection('feeds', function(er, collection) {
              collection.insert(meta, {safe: true}, function(err,rs) {
                if(err) console.log(err);
                feedId = meta.xmlurl;
              });
            });
          });
        })
        .on('article', function(article) {
          //TODO save article?
          mongo.Db.connect(mongoUri, function (err, db) {
            db.collection('articles', function(er, collection) {
              collection.insert(article, {safe: true}, function(err,rs) {
                if(err) console.log(err);
              });
              db.collection('feed_articles').insert({"feed":feedId,"article":article.guid}, {safe: false});
            });
          });
        })
        .on('end', function() {
          console.log("end");
          res.send('{"url":"' + url + '","status":"added","id":"' + feedId + '"}');
        });
    };
  });
};

