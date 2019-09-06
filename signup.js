var mongodb = require('mongodb');
var MongoClient = mongodb.MongoClient;
var ObjectId = mongodb.ObjectID;
var dburl = process.env.MONGOLAB_URI;

const bodyParser = require("body-parser");

module.exports = function(app){
  app.use(bodyParser.urlencoded({
      extended: true
  }));
  app.use(bodyParser.json());
  
  app.post('/signup', function(req, res){
    insertUser(req.body.user, res);
    res.send('Hello');
  });
  
  app.get('/signup', function(req, res){
    res.sendFile(__dirname + '/views/signup.html');
  });
};

function insertUser(user, res){
  console.log(user.email + " " + user.password);
  MongoClient.connect(dburl, function (err, client) {
    if (err) {
      console.log('Unable to connect to the mongoDB server. Error:', err);
    }
    else {
      console.log('Connection established');
      var db = client.db('course-track');
      var users = db.collection('users');
      
      users.insert({"email": user.email, "courses": []} , function(err, d){
        if (err)
          console.log("Cannot insert data " + user.email);
      });
    }
    
  });
}