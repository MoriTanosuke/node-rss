
/*
 * GET home page.
 */

exports.index = function(req, res){
  console.log('user %s', req.user);
  res.render('index', { title: 'Express', user: req.user });
};
