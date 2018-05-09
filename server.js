// server.js
// where your node app starts

// init project
var express = require('express');
var app = express();
var nodemailer = require('nodemailer');

var mongodb = require('mongodb');
var MongoClient = mongodb.MongoClient;
var ObjectId = mongodb.ObjectID;
var dburl = process.env.MONGOLAB_URI;

const axios = require("axios");
const urls = [['cse', '381', 'C'],['eng','313','I'], ['eng','313','H'], ['eng','313','G'], ['eng','313','F']];

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

app.get("/login", function (request, response){
  response.sendFile(__dirname + '/views/index.html');
});

app.get("/", function (request, response){
  response.sendFile(__dirname + '/views/index.html');
});

// http://expressjs.com/en/starter/basic-routing.html
app.get("/api/courses", function (request, response) {
  
  var i = 0;
  var data = [];
  for (var i = 0; i < urls.length; i++){
    var url =
    "https://ws.miamioh.edu/courseSectionV2/201910.json?campusCode=O&courseSubjectCode=" + 
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

// listen for requests :)
var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
  
  var http = require("http");
  setInterval(function() {
      http.get("http://course-track.herokuapp.com/");
  }, 300000);
  
  var transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: process.env.EMAIL_USER, // Your email id
            pass: process.env.EMAIL_PASS // Your password
        }
    });
  
  for (var i = 0; i < urls.length; i++){
    
    var url =
    "https://ws.miamioh.edu/courseSectionV2/201910.json?campusCode=O&courseSubjectCode=" + 
        urls[i][0] + "&courseNumber=" + urls[i][1] + "&courseSectionCode=" + urls[i][2];
    axios
    .get(url)
    .then(response => {
      var data = {
        availNow: response.data.courseSections[0].enrollmentCountAvailable,
        course: response.data.courseSections[0].courseCode
      }
      return data;
    })
    .catch(error => {
      console.log(error);
    }).then(data => {
      if (data.availNow != 0){
        var mailOptions = {
          from: 'no-reply@andre.com', // sender address
          to: 'leduyanh1011998@gmail.com', // list of receivers
          subject: 'Email Example', // Subject line
          text: 'The course ' + data.course + ' has opened more slot to ' + data.availNow 
        };
        // transporter.sendMail(mailOptions, function(error, info){
        //   if(error){
        //       console.log(error);
        //   }else{
        //       console.log('Message sent: ' + info.response);
        //   };
        // });
      }
    });
    
  }
  var mailOptions = {
          from: 'no-reply@andre.com', // sender address
          to: 'leduyanh1011998@gmail.com', // list of receivers
          subject: 'Email Example', // Subject line
          text: 'xyz'
        };
    setInterval(function(){ 
    transporter.sendMail(mailOptions, function(error, info){
          if(error){
              console.log(error);
          }else{
              console.log('Message sent: ' + info.response);
          };
        });
                        }, 300000);
  
  
}); 

// function getAvail(course){
//   MongoClient.connect(dburl, function (err, db) {
//     if (err) {
//       console.log('Unable to connect to the mongoDB server. Error:', err);
//     }
//     else {
//       console.log('Connection established');

//       var courses = db.collection('courses');
//       courses.find({
//         "course": course
//       }).toArray(function(err, data){
//         console.log(data);
//         if (data.length == 0) {
//           courses.insert({"course": course, }, function(err, data){
//             if (err)
//               console.log("Cannot insert data");
            
//           });
//         }
//         else{
//         }
//       });
//     }
    
//   });
// }
