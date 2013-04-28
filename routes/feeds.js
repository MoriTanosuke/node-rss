var FeedParser = require('feedparser')
  , request = require('request')
  , parsse = require('parsse')
  , mongo = require('mongodb');

var mongoUri = process.env.MONGOLAB_URI || process.env.MONGOHQ_URL || 'mongodb://localhost/mydb';
mongo.Db.connect(mongoUri, function (err, db) {
  db.createCollection('feeds', function(err, collection) {
    if(err) console.log(err);
    console.log('Collection "feeds" created.');
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
      collection.find().toArray(function(err, items) {
        if(err) console.log(err);
        res.send(items);
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
      collection.findOne({"_id": id}, function(err, items) {
        if(err) console.log(err);
        //TODO send feeds to frontend
        res.set('Content-Type', 'application/json');
        res.send(items);
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
      collection.remove({'_id':id}, function(err, result) {
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
      var id = -1;
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
              collection.insert({'feed': url}, {safe: true}, function(err,rs) {
                if(err) console.log(err);
                console.log(rs);
                id = rs._id;
              });
            });
          });
        })
        .on('article', function(article) {
          //TODO save article?
        })
        .on('end', function() {
          console.log("end");
          res.set('Content-Type', 'application/json');
          res.send('{"url":"' + url + '","status":"added","id":"' + id + '"}');
        });
    };
  });
};

