var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');
var mongoose = require('mongoose');
var Poll = require('./models/poll');

var app = express();

const connection = 'mongodb://umja345:umja345admin@ds161162.mlab.com:61162/pollify';
mongoose.connect(connection, { useMongoClient: true });
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error: '));

var uuid = require('uuid/v1');

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.set('view engine', 'ejs');

app.get('/', function(req, res){
    res.sendFile(__dirname + 'index.html');
});

app.get('/poll/:pollId', function(req, res){
    Poll.getPollById(req.params.pollId, (err, poll) => {
        if(err){
            console.log(err);
        }
        else{
            res.render('poll', {
                poll: poll
            });
        }
    });
});

app.post('/create_poll', function(req, res){
    var pollAnswers = req.body.answers;
    var answers = [];
    if(Array.isArray(pollAnswers)){
        pollAnswers.map(function(answer){        
            answers.push(
                {
                    'answer': answer,
                    'votes': 0
                }
            );
        });
    }
    else{
        answers.push(
            {
                'answer': pollAnswers,
                'votes': 0
            }
        )
    }
    var poll = new Poll({
        id: uuid(),
        question: req.body.question,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        answers: answers
    });
    Poll.createPoll(poll, (err, poll) => {
        if(err){
            console.log(err);
        }
        else{
            console.log('posted');
        }
    });
    res.render('poll_created', {
        pollId: poll.id
    });
});

app.post('/make_vote', function(req, res){
    voteReq = req.body;
    Poll.makeVote(voteReq, (err, poll) => {
        if(err){
            console.log(err);
        }
        else{
            console.log('vote made ' + poll);
            res.render('vote_success', {
                poll: poll
            });
        }
    });
});

app.get('/results/:pollId', function(req, res){
    Poll.getPollById(req.params.pollId, (err, poll) => {
            if(err){
                console.log(err);
            }
            else{
                res.render('poll_results', {
                    poll: poll
                });
            }
        });
});

app.listen(3000, function(){
    console.log('App started on port 3000');
});