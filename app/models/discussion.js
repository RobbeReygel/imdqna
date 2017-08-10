var mongoose = require('mongoose');

var discussionSchema = new mongoose.Schema({
    topic: String,
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
    }]
});

var Discussion = mongoose.model("Discussion", discussionSchema);

module.exports = mongoose.model('Discussion', discussionSchema);