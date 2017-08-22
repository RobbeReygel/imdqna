var User = require('./models/user');
var Discussion = require('./models/discussion');
var mongoose = require('mongoose');
var geoip = require('geoip-lite');

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
			var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress;
			if (ip !== "::1") {
				var geo = geoip.lookup(ip);
			} else {
				var geo = geoip.lookup("207.97.227.239");
			}
			res.render('index.ejs', { data : data, geo : geo});
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
		var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress;
		//var ip = "81.164.109.161";
		if (ip !== "::1") {
			var geo = geoip.lookup(ip);
		} else {
			var geo = geoip.lookup("207.97.227.239");
		}
		var myData = new Discussion(_.extend({
			city: geo.city,
			status: "open",
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

	app.get('/discussion/:id', isLoggedIn, function(req,res) {
		if (req.isAuthenticated()) {var userid = req.user._id}else{var userid = "Not_A_User"};
        Discussion.findById(req.params.id,function(err,doc) {
        	User.findOne({ '_id': doc.postedBy}, 'facebook.name local.username', function(err,person) {
        		User.find({},function(err,u) {
					res.render('discussionid.ejs', { doc : doc, person : person, u : u, userid : userid, user: req.user});
				});
        	});     
        });
      });

//	app.post('/discussion/:id', isLoggedIn, isOpen, function(req,res) {
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
//		var commentData = 
//		{
//	        text: req.body.comment,
//	        postedBy: req.user._id
//    	};
//
//		Discussion.update({ "_id": req.params.id },{ "$push": { "comments": commentData } },function (err, doc) {
//    		res.redirect('/discussion/' + req.params.id);
//		});
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
//	});


/*
	app.post('/discussion/:id/answer', isLoggedIn, isOpen, function(req,res) {
		var answerData = 
		{
	        text: req.body.answer,
	        postedBy: req.user._id,
	        question: req.body.submit
    	};

		Discussion.update({ "_id": req.params.id },{ "$push": { "answers": answerData } },function (err, doc) {
    		//res.redirect('/discussion/' + req.params.id);
    		//res.send(req.params)
    		//res.send(req.body.submit);
    		if (err) return res.send(500, { error: err });
		    return res.redirect('/discussion/' + req.params.id);
		});
	});
*/
	app.post('/discussion/:id/status', isLoggedIn, function(req,res) {
		var locked = 
		{
	        status: "locked",
    	};
    	var open = 
		{
	        status: "open",
    	};
		Discussion.findById(req.params.id,function(err,doc) {
			if (doc.status == "open") {
				Discussion.update({ "_id": req.params.id },{ status: "locked" },function (err, doc) {
					if (err) return res.send(500, { error: err });
					return res.redirect('/discussion/' + req.params.id);
				});
			}else{
				Discussion.update({ "_id": req.params.id },{ status: "open" },function (err, doc) {
					if (err) return res.send(500, { error: err });
					return res.redirect('/discussion/' + req.params.id);
				});
			}
		});
	});


};

function isLoggedIn(req, res, next) {
	if(req.isAuthenticated()){
		return next();
	}

	res.redirect('/login');
}

function isOpen(req, res, next) {
	Discussion.findById(req.params.id,function(err,doc) {
		if (doc.status == "open") {
			return next();
		}

		res.redirect('/discussion/' + req.params.id);
	});
}