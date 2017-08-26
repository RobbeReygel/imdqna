var mongoose = require('mongoose');

var discussionSchema = new mongoose.Schema({
    topic: String,
    city: String,
    status: String,
    postedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    comments: [{
        text: String,
        postedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    }],
    answers: [{
        	text: String,
	        postedBy: {
	            type: mongoose.Schema.Types.ObjectId,
	            ref: 'User'
	        },
	        question: {
	        	type: mongoose.Schema.Types.ObjectId,
	        	ref: 'Discussion'
	        }
        }],
    participants: [String]
});

var Discussion = mongoose.model("Discussion", discussionSchema);

module.exports = mongoose.model('Discussion', discussionSchema);