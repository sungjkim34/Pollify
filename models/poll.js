var mongoose = require('mongoose');

var PollSchema = new mongoose.Schema({
    question: String,
    firstName: String,
    lastName: String,
    answers: [{
        answer: String,
        votes: Number
    }],
    id: String,
    doesExpire: Boolean,
    expirationDate: Date,
    postDate: Date
});

var Poll = mongoose.model('Poll', PollSchema);

module.exports = Poll;

module.exports.getPollById = function(id, callback){
    Poll.findOne({id: id}, callback);
}

module.exports.createPoll = function(poll, callback){
    poll.save(callback);
}

module.exports.makeVote = function(poll, callback){
    Poll.findOneAndUpdate({id: poll.pollId, "answers._id":mongoose.Types.ObjectId(poll.voteAnswer)}, {$inc: {'answers.$.votes': 1}}, {new: true},callback);
}

module.exports.getAllPolls = function(callback){
    Poll.find({}, callback);
}

module.exports.deletePoll = function(id, callback){
    Poll.findOneAndRemove({id: id}, callback);
}