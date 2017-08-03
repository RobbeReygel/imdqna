var express = require('express')
var app = express();
var bodyParser = require('body-parser');
var session = require("express-session");
var passport = require('passport')
var FacebookStrategy = require('passport-facebook').Strategy;
var mongoose = require('mongoose')
app.listen(8080);


//mongoose.connect('mongodb://localhost/imdqna');

app.use(bodyParser.json());
app.use(session({
	secret: 'session',
	resave: true,
	saveUninitialized: true
}));

var FACEBOOK_APP_ID = '1358094254281606',
	FACEBOOK_APP_SECRET = '9d3e4955b1a2d48a1ffb47aa8d7ba481';



var fbOpts = {
    clientID: FACEBOOK_APP_ID,
    clientSecret: FACEBOOK_APP_SECRET,
    callbackURL: "http://localhost:8080/auth/facebook/callback",
    enableProof: true,
    profileFields: ['id', 'displayName', 'photos', 'email']  
};

var fbCallback = function(accessToken, refreshToken, profile, done) {
    console.log(accessToken, refreshToken, profile);
    done();
  };

passport.use(new FacebookStrategy(fbOpts, fbCallback));

app.get('/auth/facebook', passport.authenticate('facebook', { scope: ['email'] }));

var options = {
  successRedirect: '/profile',
  failureRedirect: '/login'
};


app.route('/auth/facebook/callback')
  .get(passport.authenticate('facebook', options));
