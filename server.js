var fs = require('fs');
var express = require('express');
var mongodb = require('mongodb');
var mongoose = require('mongoose');
var app = express();

mongoose.connect('mongodb://localhost/recommender');

var videoSchema = mongoose.Schema({
        vid:String,
        tags:String,
        thumbnail:String,
        title:String,
});

var Video = mongoose.model('Video', videoSchema);

var historyItemSchema = mongoose.Schema({
        uid:String,
        vid:String,
        tags:String,
});

var HistoryItem = mongoose.model('HistoryItem', historyItemSchema);

var userSchema = mongoose.Schema({
        name:String,
        pwd:String,
});

var User = mongoose.model('User', userSchema);

app.configure(function(){  
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(express.static(__dirname + '/public'));
    app.use(app.router);
});

app.get('/recommend', function(req, res){
    fs.readFile('./recommend.html','utf-8',function(err, data) {
        if(err) throw err;
        res.setHeader('content-type', 'text/html;charset=utf-8');
        res.end(data);
    });
});

app.get('/catch', function(req, res){
    fs.readFile('./catch.html','utf-8',function(err, data) {
        if(err) throw err;
        res.setHeader('content-type', 'text/html;charset=utf-8');
        res.end(data);
    });
});

app.get('/detail', function(req, res){
    fs.readFile('./detail.html','utf-8',function(err, data) {
        if(err) throw err;
        res.setHeader('content-type', 'text/html;charset=utf-8');
        res.cookie('vid',req.query.vid);
        res.end(data);
    });
});

app.get('/index', function(req, res){
    fs.readFile('./index.html','utf-8',function(err, data) {
        if(err) throw err;
        res.setHeader('content-type', 'text/html;charset=utf-8');
        res.end(data);
    });
});

app.post('/addhistory', function(req, res){
    var uid = req.body.uid;
    var vid = req.body.vid;
    var tags = req.body.tags;
    HistoryItem.findOne({uid:uid,vid:vid},function(err,item){
        if(err) console.log("find user fail");
        if(!item){
            var historyItem = new HistoryItem({'uid':uid,'vid':vid,'tags':tags});
            historyItem.save(function (err, historyItem) {
                if (err){
                    console.log("save fail");
                }
                res.send(200,historyItem);
            });
        }else{
            res.send(200,item);
        }
    });
});

app.post('/addvideo', function(req, res){
    var vid = req.body.vid;
    var tags = req.body.tags;
    var thumbnail = req.body.thumbnail;
    var title = req.body.title;
    Video.findOne({vid:vid},function(err,item){
        if(err) console.log("find video fail");
        if(!item){
            var video = new Video({'vid':vid,'tags':tags,'thumbnail':thumbnail,'title':title});
            video.save(function (err, video) {
                if (err){
                    console.log("save fail");
                }
                res.send(200,video);
            });
        }else{
            res.send(200,{warn:'repeated'});
        }
    });
});

app.post('/register', function(req, res){
    var params = req.body;
    var name = params.name;
    var pwd= params.pwd;
    User.findOne({name:name},function(err,user){
        if(err) console.log("find user fail");
        if(!user){
            var userReg = new User({'name':name,'pwd':pwd});
            userReg.save(function (err, user) {
                if (err) console.log("save fail");
            });
            res.send(200,{exist:false});
        }else{
            res.send(200,{exist:true});
        }
    });
});

app.post('/login', function(req, res){
    var params = req.body;
    var name = params.name;
    var pwd= params.pwd;
    User.findOne({name:name,pwd:pwd},function(err,user){
        if(err) console.log("find user fail");
        if(!user){
            res.send(200,{exist:false});
        }else{
            res.cookie('uid',user.id);
            res.send(200,{exist:true});
        }
    });
});

app.post('/history', function(req, res){
    var uid = req.body.uid;
    HistoryItem.find({uid:uid},function(err,videos){
        if(err) throw err;
        res.setHeader('content-type', 'text/html;charset=utf-8');
        res.send(200,videos);
    });
});

app.get('/newvideo', function(req, res){
    var query = Video.find();
    query.limit(100);
    query.exec(function(err,videos){
        if(err) throw err;
        res.setHeader('content-type', 'text/html;charset=utf-8');
        res.send(200,videos);
    });
});

app.listen(3000);
