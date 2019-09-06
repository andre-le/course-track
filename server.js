var express = require('express');
var app = express();
require('./login')(app);
require('./signup')(app);

var nodemailer = require('nodemailer');

var mongodb = require('mongodb');
var MongoClient = mongodb.MongoClient;
var ObjectId = mongodb.ObjectID;
var dburl = process.env.MONGOLAB_URI;

const axios = require("axios");
const urls = [['cse', '470J', 'A'],['cse','443','B'],['cse', '470J', 'B'],['fin','461','B'],['bus','284','T']
             ,['fin','404','A']];

app.use(express.static('public'));

app.get("/", function (request, response){
  response.sendFile(__dirname + '/views/index.html');
});

app.get("/api/courses", function (request, response) {
  
  var i = 0;
  var data = [];
  for (var i = 0; i < urls.length; i++){
    var url =
    "https://ws.miamioh.edu/courseSectionV2/202010.json?campusCode=O&courseSubjectCode=" + 
        urls[i][0] + "&courseNumber=" + urls[i][1] + "&courseSectionCode=" + urls[i][2];
    axios
    .get(url)
    .then(response => {
      var course = {
        'courseCode': response.data.courseSections[0].courseCode,
        'max': response.data.courseSections[0].enrollmentCountMax,
        'active': response.data.courseSections[0].enrollmentCountActive,
        'available': response.data.courseSections[0].enrollmentCountAvailable
      }
      return course;
    })
    .catch(error => {
      console.log(error);
    }).then(course => {
      data.push(course);
      if (data.length == urls.length)
        response.send({data: data });
    });
  }
});

// listen for requests
var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
  
  var http = require("http");
  setInterval(function() {
      http.get("http://course-track.herokuapp.com/");
  }, 300000);
  
  var transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: process.env.EMAIL_USER, // email id
            pass: process.env.EMAIL_PASS // password
        }
    });
  
  //go to the API and check for changes every 30 seconds
  setInterval(function(){ 
    for (var i = 0; i < urls.length; i++){

      var url =
      "https://ws.miamioh.edu/courseSectionV2/201910.json?campusCode=O&courseSubjectCode=" + 
          urls[i][0] + "&courseNumber=" + urls[i][1] + "&courseSectionCode=" + urls[i][2];
      axios
      .get(url)
      .then(response => {
        var course = {
          availNow: response.data.courseSections[0].enrollmentCountAvailable,
          course: response.data.courseSections[0].courseCode
        }
        return course;
      })
      .catch(error => {
        console.log(error);
      }).then(function(course) {
        getAvail(course).then(function(avail){
          console.log(course.availNow + " " + avail);
            if (course.availNow != avail){
              var mailOptions = {
                from: 'no-reply@andre.com', // sender address
                to: 'lienhoa.nguyen273@gmail.com', // list of receivers
                subject: 'Change in ' + course.course, // Subject line
                text: 'The course ' + course.course + ' has changed the open slots from ' + avail + ' to ' + course.availNow
              };
              transporter.sendMail(mailOptions, function(error, info){
                if(error){
                    console.log(error);
                }else{
                    console.log('Message sent: ' + info.response);
                };
              });
          }
        });
      });

    }
  }, 30000);
  
}); 


//return Promise object contains data of the course
function getAvail(course){
  return new Promise(function(resolve, reject) {
      MongoClient.connect(dburl, function (err, client) {
    if (err) {
      console.log('Unable to connect to the mongoDB server. Error:', err);
    }
    else {
      var db = client.db('course-track');
      var courses = db.collection('courses');
      courses.find({
        "course": course.course
      }).toArray(function(err, data){
        console.log(data);
        if (data.length == 0) {
          courses.insert({"course": course.course, "available": course.availNow} , function(err, d){
            if (err)
              console.log("Cannot insert data " + course.course);
          });
          resolve(course.availNow);
        }
        else{
          courses.update({"course": course.course}, {"course": course.course, "available": course.availNow}, function(err, data){
            if (err)
              console.log("Cannot update data");
          });
          resolve(data[0].available);
        }
      });
    }
  })});
}

function insertCourse(obj){
  MongoClient.connect(dburl, function (err, client) {
    if (err) {
      console.log('Unable to connect to the mongoDB server. Error:', err);
    }
    else {
      console.log('Connection established');
      var db = client.db('course-track');
      var courses = db.collection('courses'); 
    }    
  });
}

