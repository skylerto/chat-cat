var express = require('express'),
    app = express(),
    path = require('path'),
    cookieParser = require('cookie-parser'),
    session = require('express-session'),
    config = require('./config/config.js'),
    ConnectMongo = require('connect-mongo')(session),
    mongoose = require('mongoose'),
    passport = require('passport'),
    FacebookStrategy = require('passport-facebook').Strategy,
    rooms = [];

app.set('views', path.join(__dirname, 'views'));
app.engine('html', require('hogan-express'));
app.set('view engine', 'html');

mongoose.connect(config.dbURL, function(err) {
  if(err != undefined){
    console.log("MONGOOSE-CONNECT: " + err);
  } else {
    console.log("MONGOOSE-CONNECT: Database connection established");
  }
});

app.use(express.static(path.join(__dirname, 'public')));

app.use(cookieParser());

var env = process.env.NODE_ENV || 'development';
setupENV(env);

// Initialze passport
app.use(passport.initialize());
app.use(passport.session());
require('./auth/passportAuth.js')(passport, FacebookStrategy, config, mongoose);

// Setup the routes
require('./routes/routes.js')(express, app, passport, config, rooms);

// app.listen(3000, confirmListen);
//
// function confirmListen(req, res, next){
//   console.log("ChatCAT running on port 3000");
//
// }

// Create own http server for communication protocol
app.set('port', process.env.PORT || 3000);
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
require('./socket/socket.js')(io, rooms);
server.listen(app.get('port'), function(){
  console.log('ChatCAT on: ' + config.host);
  console.log("Mode " + env );
});



/*
* Setup environment middleware
*/
function setupENV(env){
  if(env === 'development') {
    // If NOT using express-session's 1.2.0 add saveUninitialize:true, resave:true to the hash
    app.use(session({
      secret:config.sessionSecret
    }));
  } else {
    // Production
    app.use(session({
      secret:config.sessionSecret,
      store: new ConnectMongo({
        url:config.dbURL,
        mongoose_connection:mongoose.connections[0],
        stringify:true
      }) // Store the DB connection in the user session
    }));
  }
}



// //Setting up and usering mongoose.
// var userShema = mongoose.Schema({
//   username:String,
//   password:String,
//   fullname:String,
// });
// var Person = mongoose.model('users', userShema);
// var John = new Person({
//   username:'johndoe',
//   password:'johnwantstologin',
//   fullname:'John Doe'
// });
// John.save(function(err){
//   if (err != undefined) {
//     console.log(err);
//   } else {
//     console.log("Done!");
//   }
// });
