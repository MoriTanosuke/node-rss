var FeedParser = require('feedparser')
  , request = require('request')
  , parsse = require('parsse')
  , db = require('../db')
  , mongoose = require('mongoose');

var Feed = mongoose.model('Feed', feedSchema);
var Article = mongoose.model('Article', articleSchema);

/*
 * GET feeds listing
 */
exports.list = function(req, res) {
  // load feeds from mongodb
  Feed.all(function(err, feeds) {
    if(err) console.log(err);
      // TODO make sort order configurable
      res.render('feeds', { title: "Feeds", user: req.user, feeds: feeds });
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
  Feed.findById(id, function(err, feed) {
    if(err) console.log(err);
    // send feeds to frontend, including articles
    // TODO make sort order configurable
    Article.findByFeed(feed.xmlurl, function(err, articles) {
      if(err) console.log(err);
      res.render('feed', {title: feed.title, user: req.user, feed: feed, articles: articles});
    });
  });
};

/*
 * DELETE a feed
 */
exports.delete = function(req, res) {
  var id = req.param('id');
  //TODO delete feed from mongodb
  Feed.findById(id, function(err, feed) {
    if(err) console.log('Can not find feed', err);
    Article.removeByFeed(feed.xmlurl, function(err) {
      if(err) console.log('Can not remove articles', err);
    });
  });
  Feed.removeById(id, function(err) {
    if(err) console.log('Can not remove feed', err);
  });
  res.redirect('/feeds');
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
      var f = {};
      var articles = new Array();
      // read feed for the first time
      request(url)
        .pipe(new FeedParser())
        .on('error', function(err) {
          console.log(err);
        })
        .on('meta', function(meta) {
          f = meta;
        })
        .on('article', function(article) {
          articles.push(article);
        })
        .on('end', function() {
          console.log("end");
          //TODO check if feed & create if nonexisting
          var feed = new Feed({
            link: f.link,
            xmlurl: f.xmlurl,
            pubdate: f.pubdate,
            title: f.title,
            author: f.author
          });
          feed.save(function(err) {
            if(err) console.log('can not save feed: %s', err);
          });
          //save article
          for(i in articles) {
            var article = new Article({
              xmlurl: articles[i].xmlurl,
              link: articles[i].link,
              pubdate: articles[i].pubdate,
              title: articles[i].title,
              description: articles[i].description,
              meta: articles[i].meta
            });
            article.save(function(err) {
              if(err) console.log('can not save article: %s', err);
            });
          }
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
