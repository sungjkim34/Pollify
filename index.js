var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');
var mongoose = require('mongoose');
var Poll = require('./models/poll');
var moment = require('moment');

var app = express();

const connection = 'mongodb://umja345:umja345admin@ds161162.mlab.com:61162/pollify';
mongoose.connect(connection, { useMongoClient: true });
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error: '));

var uuid = require('uuid/v1');

app.use(express.static(path.join(__dirname, 'views')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.set('view engine', 'ejs');

app.get('/', function(req, res){
    res.render('home');
});

app.get('/poll/:pollId', function(req, res){
    var date = new Date();
    console.log(date);
    console.log(Date.parse(date));
    Poll.getPollById(req.params.pollId, (err, poll) => {
        if(err || !poll){
            console.log('Error: ' + err);
            res.render('error');
        }
        else{
            console.log('expires ' + Date.parse(poll.expirationDate));
            console.log(poll.expirationDate);
            res.render('poll', {
                poll: poll,
                currentDate: Date.parse(date),
                moment: moment
            });
        }
    });
});

app.post('/create_poll', function(req, res){
    var pollAnswers = req.body.answers;
    var tempExpirationDate = moment(req.body.expirationDate,"MM/DD/YYYY h:mm A");
    var expirationDate = new Date(tempExpirationDate.utcOffset('-4').format('YYYY-MM-DD HH:mm'));
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
    var poll;
    if(req.body.doesExpire){
        poll = new Poll({
            id: uuid(),
            question: req.body.question,
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            answers: answers,
            doesExpire: true,
            expirationDate:  expirationDate
        });
    }
    else{
        poll = new Poll({
            id: uuid(),
            question: req.body.question,
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            answers: answers,
            doesExpire: false
        });
    }
    Poll.createPoll(poll, (err, poll) => {
        if(err || !poll){
            console.log('Error:' + err);
            res.render('error');
        }
        else{
            console.log('posted');
            res.render('poll_created', {
                pollId: poll.id
            });
        }
    });
});

app.post('/make_vote', function(req, res){
    voteReq = req.body;
    Poll.makeVote(voteReq, (err, poll) => {
        if(err || !poll){
            console.log('Error:' + err);
            res.render('error');
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
            if(err || !poll){
                console.log('Error:' + err);
                res.render('error');
            }
            else{
                res.render('poll_results', {
                    poll: poll
                });
            }
        });
});

app.get('/fyadmin', function(req, res){
    res.render('admin');
});

app.get('/admin', function(req, res){
    res.render('error');
});

app.post('/admin', function(req, res){
    if(req.body.username === 'fyadmin' && req.body.password === 'fypassword'){
        Poll.getAllPolls((err, polls) => {
            if(err || !polls){
                console.log('Error:' + err);
                res.render('error');
            }
            else{
                res.render('adminpanel', {
                    polls: polls
                });
            }
        });
    }
    else{
        res.render('adminerror');
    }
});

app.post('/delete_poll', function(req, res){
    Poll.deletePoll(req.body.id, (err, polls) => {
        res.render('adminpanel', {
            polls: polls
        });
    });
});

var port = Number(process.env.PORT || 3000);
app.listen(port, function(){
    console.log('App started on port ' + port);
});