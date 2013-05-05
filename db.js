var mongoose = require('mongoose');

/*
 * connect to DB
 */
var mongoUri = process.env.MONGOLAB_URI || process.env.MONGOHQ_URL || 'mongodb://localhost/mydb';
mongoose.connect(mongoUri);
var db = mongoose.connection;
/*
 * bind error handler
 */
db.on('error', console.error.bind(console, 'connection error:'));

/*
 * define Feed schema
 */
exports.feedSchema = feedSchema = mongoose.Schema({
  title: String,
  link: String,
  xmlurl: String,
  pubdate: Date,
  author: String
});
feedSchema.statics.findByUrl = function(name, cb) {
  this.find({xmlurl: name}, cb);
};
feedSchema.statics.findById = function(name, cb) {
  this.findOne({_id: mongoose.Types.ObjectId(name)}, cb);
};
feedSchema.statics.removeById = function(name, cb) {
  this.remove({_id: mongoose.Types.ObjectId(name)}, cb);
};
feedSchema.statics.all = function(cb) {
  this.find().sort('-pubdate').exec(cb);
};

/*
 * define Article schema
 */
exports.articleSchema = articleSchema = mongoose.Schema({
  xmlurl: String,
  link: String,
  pubdate: Date,
  title: String,
  description: String,
  meta: Object
});
articleSchema.statics.findByUrl = function(name, cb) {
  this.find({xmlurl: name}, cb);
};
articleSchema.statics.findByFeedUrl = function(name, cb) {
  this.find({'meta.xmlurl': name}, cb);
};
articleSchema.statics.all = function(cb) {
  this.find().sort('-pubdate').exec(cb);
};
articleSchema.statics.findByFeed = function(xmlurl, cb) {
  this.find({'meta.xmlurl': xmlurl}).sort('-pubdate').exec(cb);
}
articleSchema.statics.findById = function(name, cb) {
  this.findOne({_id: mongoose.Types.ObjectId(name)}, cb);
};
articleSchema.statics.removeByFeed = function(xmlurl, cb) {
  this.remove({'meta.xmlurl': xmlurl}).exec(cb);
}
