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
var fileUpload = require('express-fileupload');

var http = require('http').Server(app);
var io = require('socket.io')(http);

var connectCounter = 0;
var User = require('./app/models/user');
var Discussion = require('./app/models/discussion');

io.on('connection', function(socket){
		connectCounter++; 
		console.log('\x1b[37m[\x1b[32mConnected\x1b[37m] \x1b[0m' + socket.id + ' (\x1b[32m'+connectCounter+'\x1b[0m)');
	
	socket.on('disconnect', function(){
		connectCounter--; 
	    console.log('\x1b[37m[\x1b[31mDisconnected\x1b[37m] \x1b[0m' + socket.id + ' (\x1b[31m'+connectCounter+'\x1b[0m)');
	});

	socket.on('subscribe', function(room) {
		socket.nickname = room.nick;
    	socket.join(room.id);
    	console.log('\x1b[37m[\x1b[32mRoom\x1b[37m] \x1b[0m' + socket.nickname + ' (\x1b[32m' +room.id+'\x1b[0m)');
    	Discussion.findOneAndUpdate({_id: room.id}, {$push: {participants: room.uid}},function (err, doc) {

    	});

		io.sockets.in(room.id).emit('adduser', {
    		id: room.id,
    		nick: room.nick,
    		uid: room.uid,
    		avatar: room.avatar
		});
	});

	socket.on('unsubscribe', function(room) {
		socket.nickname = room.nick;
    	socket.leave(room.id);
    	console.log('\x1b[37m[\x1b[31mRoom\x1b[37m] \x1b[0m' + socket.nickname + ' (\x1b[31m' +room.id+'\x1b[0m)');
    	Discussion.findOneAndUpdate({_id: room.id}, {$pull: {participants: room.uid}},function (err, doc) {
    		
    	});

    	io.sockets.in(room.id).emit('removeuser', {
    		id: room.id,
    		nick: room.nick,
    		uid: room.uid,
    		avatar: room.avatar
		});
	});

	socket.on('question', function(data){
        var commentData = 
		{
	        text: data.message,
	        postedBy: data.postedBy
    	};

		Discussion.update({ _id: data.did },{ "$push": { "comments": commentData } },function (err, doc) {

		Discussion.findById(data.did,function(err,doc) {
			var BreakException = {};
			try {
			doc.comments.forEach(function(d) {
				if(d.text ==  data.message && d.postedBy == data.postedBy) {
					io.sockets.in(data.did).emit('question2', {
				    message: data.message,
			      	handle:  data.handle,
			      	postedBy: data.postedBy,
			      	did: data.did,
			      	qid: d.id
				});
				throw BreakException;
				}
			});
			} catch (e) {
				if (e !== BreakException) throw e;
			}
		});

		});

		
    });

    socket.on('answer', function(data){
        var answerData = 
		{
	        text: data.message,
	        postedBy: data.postedBy,
	        question: data.question
    	};

		Discussion.update({ _id: data.did },{ "$push": { "answers": answerData } },function (err, doc) {
			Discussion.findById(data.did,function(err,doc) {
			var BreakException = {};
			try {
			doc.answers.forEach(function(d) {
				if(d.text ==  data.message && d.postedBy == data.postedBy) {
					io.sockets.in(data.did).emit('answer2', {
				    message: data.message,
			      	handle:  data.handle,
			      	postedBy: data.postedBy,
			      	did: data.did,
			      	question: data.question,
			      	aid: d.id
				});
					throw BreakException;
				}
			});
			} catch (e) {
				if (e !== BreakException) throw e;
			}
		});

		});
    });

    socket.on('removeq', function(data){
    	//remove comments
		Discussion.update({ _id: data.did },{ "$pull": { "comments": { "_id": data.btn} } },function (err, doc) {});
		//remove answers
		Discussion.update({ _id: data.did },{ "$pull": { "answers": { "question": data.btn} } },function (err, doc) {});
		
		io.sockets.in(data.did).emit('removeq', {
			did: data.did,
		    btn: data.btn
		});
    });

    socket.on('removea', function(data){
		//remove answer
		Discussion.update({ _id: data.did },{ "$pull": { "answers": { "_id": data.btn} } },function (err, doc) {});
		
		io.sockets.in(data.did).emit('removea', {
			did: data.did,
		    btn: data.btn
		});
    });

    socket.on('lock', function(data){
		var locked = 
		{
	        status: "locked",
    	};
    	var open = 
		{
	        status: "open",
    	};
		Discussion.findById(data.did,function(err,doc) {
			if (doc.status == "open") {
				Discussion.update({ _id: data.did },{ status: "locked" },function (err, doc) {});
				io.sockets.in(data.did).emit('lock', data);
			}else{
				Discussion.update({ _id: data.did },{ status: "open" },function (err, doc) {});
				io.sockets.in(data.did).emit('open', data);
			}
		});
    });
});

var configDB = require('./config/database.js');
mongoose.connect(configDB.url);
require('./config/passport')(passport);

app.use(morgan('dev'));
app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: false}));
app.use(session({secret: 'secret123',
				 saveUninitialized: true,
				 resave: true}));

app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session
app.use(fileUpload());
app.use(express.static(__dirname + '/public'));

app.set('view engine', 'ejs');



require('./app/routes.js')(app, passport);

//app.listen(port);
//console.log('Server running on port: ' + port);

http.listen(port, function(){
  console.log('\x1b[37m[\x1b[32m!\x1b[37m] Server running on port: \x1b[32m' + port + '\x1b[0m');
});




