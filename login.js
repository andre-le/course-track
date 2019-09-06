const bodyParser = require("body-parser");

module.exports = function(app){
  app.use(bodyParser.urlencoded({
      extended: true
  }));
  app.use(bodyParser.json());
  
  app.post('/login', function(req, res){
        console.log(req.body.user.name);
  });
  
  app.get('/login', function(req, res){
    res.sendFile(__dirname + '/views/login.html');
  });
};