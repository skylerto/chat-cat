module.exports = function(express, app, passport, config, rooms){
  var router = express.Router();

  router.get('/', function(req, res, next){
    res.render('index', {title: 'Welcome to ChatCAT'});
  });

  /*
  * Middleware to check authenticated route.
  */
  function securePages(req, res, next){
    if(req.isAuthenticated()){
      next();
    } else {
      res.redirect('/');
    }
  }

  router.get('/auth/facebook', passport.authenticate('facebook'));
  router.get('/auth/facebook/callback', passport.authenticate('facebook', {
    successRedirect:'/chatrooms',
    failureRedirect:'/'
  }));

  router.get('/logout', function(req, res, next){
    req.logout();
    res.redirect('/');
  });

  router.get('/roomlist', securePages);

  router.get('/chatrooms', securePages, function(req, res, next){
    res.render('chatrooms', {
      title: 'Chatrooms',
      user:req.user,
      config:config
    });
  });

  router.get('/room/:id', securePages, function(req, res, next){
    var room_name = findTitle(req.params.id); // using req params
    res.render('room', {
      title: 'Chatroom',
      user:req.user,
      room_number:req.params.id,
      room_name:room_name,
      config:config
    });
  });

  /*
  * Search over the rooms list to find the room name.
  */
  function findTitle(room_id){
    var n = 0;
    while(n < rooms.length){
      if(rooms[n].room_number == room_id){
        return rooms[n].room_name;
        break;
      } else {
        n++;
        continue;
      }
    }
  }






/*
* Toy routes
*/
  router.get('/setcolor', function(req, res, next){
    req.session.favColor = "Red";
    res.send("Setting fave color");
  })

  router.get('/getcolor', function(req, res, next){
    res.send("Fav color is set to " + (req.session.favColor===undefined?"Not Found":req.session.favColor));
  })

  app.use('/', router);

}
