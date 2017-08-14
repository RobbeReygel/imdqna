var User = require('./models/user');
var Discussion = require('./models/discussion');
var mongoose = require('mongoose');

module.exports = function(app, passport){

	app.get('/', function(req, res){
/*
		Discussion.find({topic:{ $ne: "" }}, function(err, data){
			Discussion.count({topic:{ $ne: "" }}, function (err, c) {
				res.render('index.ejs', { data : data, count : c });
			});
    	});

		Discussion.find({ _id: d.postedBy },{ topic: 1}, function(err, data) {
			res.render('index.ejs', { data : data});
		});
*/
		Discussion.find({topic:{ $ne: "" }}, function(err, data){
			res.render('index.ejs', { data : data});
    	});
	});

	app.get('/login', function(req, res){
		res.render('login.ejs', { message: req.flash('loginMessage') });
	});
	app.post('/login', passport.authenticate('local-login', {
		successRedirect: '/profile',
		failureRedirect: '/login',
		failureFlash: true
	}));

	app.get('/signup', function(req, res){
		res.render('signup.ejs', { message: req.flash('signupMessage') });
	});


	app.post('/signup', passport.authenticate('local-signup', {
		successRedirect: '/',
		failureRedirect: '/signup',
		failureFlash: true
	}));

	app.get('/profile', isLoggedIn, function(req, res){
		res.render('profile.ejs', { user: req.user });
	});

	app.get('/auth/facebook', passport.authenticate('facebook', {scope: ['email']}));

	app.get('/auth/facebook/callback', 
	  passport.authenticate('facebook', { successRedirect: '/profile',
	                                      failureRedirect: '/' }));


	app.get('/logout', function(req, res){
		req.logout();
		res.redirect('/');
	})

	app.get('/discussion/create', isLoggedIn, function(req, res){
		res.render('creatediscussion.ejs', { user: req.user });
	});

	app.post("/discussion/create", isLoggedIn, function(req,res){
		//save topic to mongodb
		//TODO add valid field check
		//var myData = new Discussion(req.body);
		_ = require("underscore");
		var myData = new Discussion(_.extend({
		    postedBy: req.user._id,
		    comments: []
		}, req.body));

		myData.save()
        .then(item => {
            res.redirect('/');
        })
        .catch(err => {
            res.status(400).send("Unable to save to database");
        });
	})

	app.get('/discussion', function(req,res) {
        Discussion.find(function(err,docs) {
          res.render('discussion.ejs', { docs : docs});
        });
      });

	app.get('/discussion/:id', function(req,res) {
        Discussion.findById(req.params.id,function(err,doc) {
        	User.findOne({ '_id': doc.postedBy}, 'facebook.name local.username', function(err,person) {
				res.render('discussionid.ejs', { doc : doc, person : person});
        	});     
        });
      });


	app.post('/discussion/:id', isLoggedIn, function(req,res) {
		//save question to mongodb
		/*
		Discussion.findOneAndUpdate(req.params.id, function(err, p) {
			var myData = new Discussion({
		    	comments: [{
		        text: "Sample Comment",
		        postedBy: req.user._id
		    	}
			]});
		});
*/
		var commentData = 
		{
	        text: req.body.comment,
	        postedBy: req.user._id
    	};

		Discussion.update({ "_id": req.params.id },{ "$push": { "comments": commentData } },function (err, doc) {
    		res.redirect('/discussion/' + req.params.id);
		});
/*
		var query = {'_id': req.params.id};
		var newData = {
		    	comments: [{
		        text: req.body.comment,
		        postedBy: req.user._id
		    	}]
		    };
		Discussion.findOneAndUpdate(query, newData, function(err, doc){
		    if (err) return res.send(500, { error: err });
		    return res.send("succesfully saved");
		});

*/
	});


	/*
	var myData = new Discussion(_.extend({
		    postedBy: req.user._id
		    comments: [{
		        text: "Nice post!",
		        postedBy: joe._id
		    }, {
		        text: "Thanks :)",
		        postedBy: alex._id
		    }]
		}, req.body));
	*/

};

function isLoggedIn(req, res, next) {
	if(req.isAuthenticated()){
		return next();
	}

	res.redirect('/login');
}