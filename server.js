var express = require('express');
var app = express();
var port = process.env.PORT || 8080;

var cookieParser = require('cookie-parser');
var session = require('express-session');
var morgan = require('morgan');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var passport = require('passport');
var flash = require('connect-flash');

var http = require('http').Server(app);
var io = require('socket.io')(http);

var connectCounter = 0;
var User = require('./app/models/user');
var Discussion = require('./app/models/discussion');

io.on('connection', function(socket){
		connectCounter++; 
		console.log(socket.id + ' connected');
		console.log("Total clients connected: " + connectCounter)
	
	socket.on('disconnect', function(){
		connectCounter--; 
	    console.log(socket.id + ' disconnected');
	    console.log("Total clients connected: " + connectCounter)
	});

	socket.on('chat', function(data){
        io.sockets.emit('chat', data);
        var commentData = 
		{
	        text: data.message,
	        postedBy: data.postedBy
    	};

		Discussion.update({ _id: data.did },{ "$push": { "comments": commentData } },function (err, doc) {});
    });
});

var configDB = require('./config/database.js');
mongoose.connect(configDB.url);
require('./config/passport')(passport);

app.use(morgan('dev'));
app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: false}));
app.use(session({secret: 'anystringoftext',
				 saveUninitialized: true,
				 resave: true}));

app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session


app.set('view engine', 'ejs');


// app.use('/', function(req, res){
// 	res.send('Our First Express program!');
// 	console.log(req.cookies);
// 	console.log('================');
// 	console.log(req.session);
// });

require('./app/routes.js')(app, passport);

//app.listen(port);
//console.log('Server running on port: ' + port);

http.listen(port, function(){
  console.log('Server running on port: ' + port);
});




