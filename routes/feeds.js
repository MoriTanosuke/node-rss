var FeedParser = require('feedparser')
  , request = require('request')
  , parsse = require('parsse')
  , db = require('../db');

/*
 * GET feeds listing
 */
exports.list = function(req, res) {
  // load feeds from mongodb
  db.feeds(function(err, feeds) {
    if(err) console.log(err);
    // TODO make sort order configurable
    feeds.find().sort({pubdate: -1}).toArray(function(err, items) {
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
};

/*
 * GET a feed
 */
exports.show = function(req, res) {
  var id = req.param('id');
  // TODO read feed from mongodb
  db.feeds(function(err, feeds) {
    if(err) console.log(err);
    feeds.findOne({"_id":db.ID(id)}, function(err, feed) {
      if(err) console.log(err);
      // send feeds to frontend, including articles
      db.articles(function(err, a) {
        if(err) console.log(err);
        a.find({'meta.xmlurl': feed.xmlurl}).sort({pubdate: -1}).toArray(function(err, articles) {
          if(err) console.log(err);
          res.render('feed', {title: feed.title, user: req.user, feed: feed, articles: articles});
        });
      });
    });
  });
};

/*
 * DELETE a feed
 */
exports.delete = function(req, res) {
  var id = req.param('id');
  console.log('id=%s', id);
  //TODO delete feed from mongodb
  db.feeds(function(err, feeds) {
    if(err) console.log(err);
    console.log('feeds=%s', feeds);
    feeds.findOne({'_id': db.ID(id)}, function(err, feed) {
      if(err) console.log(err);
      console.log('feed=%s', feed);
      db.articles(function(err, articles) {
        articles.remove({'meta.xmlurl': feed.xmlurl});
      });
    });
    feeds.remove({'_id': db.ID(id)}, function(err, result) {
      if(err) console.log(err);
      res.redirect('/feeds');
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
      var feed = {};
      var articles = new Array();
      // read feed for the first time
      request(url)
        .pipe(new FeedParser())
        .on('error', function(err) {
          console.log(err);
        })
        .on('meta', function(meta) {
          feed = meta;
        })
        .on('article', function(article) {
          articles.push(article);
        })
        .on('end', function() {
          console.log("end");
          //TODO check if feed & create if nonexisting
          db.feeds(function(er, collection) {
            collection.insert(feed, {safe: true}, function(err,rs) {
              if(err) console.log(err);
            });
          });
          //save article
          db.articles(function(er, collection) {
            for(i in articles) {
              // store article itself
              collection.insert(articles[i], {safe: false});
            }
          });
          res.redirect('/feeds');
        });
    };
  });
};

/*
 * Load new articles
 */
exports.update = function(req, res) {
  var feed = req.params('feed');
  console.log('Update %s', feed);
  res.redirect('/feeds');
};
