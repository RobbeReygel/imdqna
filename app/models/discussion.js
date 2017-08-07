var mongoose = require('mongoose');
var discussionSchema = new mongoose.Schema({
    topic: String,
});

var Discussion = mongoose.model("Discussion", discussionSchema);

module.exports = mongoose.model('Discussion', discussionSchema);