
var db = require('../db')
  , mongoose = require('mongoose');

var Article = mongoose.model('Article', articleSchema);
var Feed = mongoose.model('Feed', feedSchema);

/*
 * GET articles
 */
exports.list = function(req, res) {
    // TODO make sort order configurable
  Article.all(function(err, articles) {
    if(err) console.log(err);
    res.render('articles', { title: "Articles", user: req.user, articles: articles });
    //TODO send feeds to frontend
    //TODO create nice listing
  });
};
