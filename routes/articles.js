
var db = require('../db');

/*
 * GET articles
 */
exports.list = function(req, res) {
  db.articles(function(err, collection) {
    if(err) console.log(err);
    // TODO make sort order configurable
    collection.find().sort({pubdate: -1}).toArray(function(err, items) {
      if(err) console.log(err);
      //TODO check accept header
      var articles = new Array();
      for(i in items) {
        articles.push(items[i]);
      }
      res.render('articles', { title: "Articles", user: req.user, articles: articles });
    });
    //TODO send feeds to frontend
    //TODO create nice listing
  });
};

