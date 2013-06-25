var express = require('express')
  , http = require('http')
  , passport = require('passport')
  , util = require('util')
  , Strategy = require('../../../passport-freshbooks').Strategy;

var app = express();

// configure Express
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(express.logger());
app.use(express.cookieParser());
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.session({ secret: 'keyboard cat' }));
// Initialize Passport!  Also use passport.session() middleware, to support
// persistent login sessions (recommended).
app.use(passport.initialize());
app.use(passport.session());
app.use(app.router);
app.use(express.static(__dirname + '/public'));

var SERVER_NAME = "michaeljcole.freshbooks.com";
var AUTH_TOKEN = "32c6157497e68973987c4ce39695e84f";
var OAUTH_SECRET = "wvyRBZNB8aG8RjyYhkmwkCUi3v8YxSGHe";

// Passport session setup.
//   To support persistent login sessions, Passport needs to be able to
//   serialize users into and deserialize users out of the session.  Typically,
//   this will be as simple as storing the user ID when serializing, and finding
//   the user by ID when deserializing.  However, since this example does not
//   have a database of user records, the complete profile is
//   serialized and deserialized.
passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});


// Use the Strategy within Passport.
//   Strategies in passport require a `verify` function, which accept
//   credentials (in this case, a token, tokenSecret, and profile), and
//   invoke a callback with a user object.
passport.use(new Strategy({
    serverName: SERVER_NAME,
    consumerKey: AUTH_TOKEN,
    consumerSecret: OAUTH_SECRET,
    callbackURL: "http://127.0.0.1:3000/auth/freshbooks/callback"
  },
  function(token, tokenSecret, profile, done) {
    // asynchronous verification, for effect...
    process.nextTick(function () {
      // To keep the example simple, the user's profile is returned to
      // represent the logged-in user.  In a typical application, you would want
      // to associate the account with a user record in your database,
      // and return that user instead.
      return done(null, profile);
    });
  }
));

app.get('/', function(req, res){
  res.render('index', { user: req.user });
});

app.get('/account', ensureAuthenticated, function(req, res){
  res.render('account', { user: req.user });
});

app.get('/login', function(req, res){
  res.render('login', { user: req.user });
});

// GET /auth/freshbooks
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  The first step in authentication will involve
//   redirecting the user to freshbooks.com.  After authorization, this will
//   redirect the user back to this application at /auth/freshbooks/callback
app.get('/auth/freshbooks',
  passport.authenticate('freshbooks'),
    function(req, res){
      // The request will be redirected to Freshbooks for authentication, so this
      // function will not be called.
    });

// GET /auth/freshbooks/callback
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  If authentication fails, the user will be redirected back to the
//   login page.  Otherwise, the primary route function function will be called,
//   which, in this example, will redirect the user to the home page.
app.get('/auth/freshbooks/callback',
  passport.authenticate('freshbooks', { failureRedirect: '/login' }),
    function(req, res) {
      res.redirect('/');
    });

app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});


// Simple route middleware to ensure user is authenticated.
//   Use this route middleware on any resource that needs to be protected.  If
//   the request is authenticated (typically via a persistent login session),
//   the request will proceed.  Otherwise, the user will be redirected to the
//   login page.
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/login');
}
