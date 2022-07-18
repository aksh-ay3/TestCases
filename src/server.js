const fs = require('fs');
const path = require('path');
const https = require('https');
const express = require('express');
const helmet = require('helmet');
const passport = require('passport');
const { Strategy } = require('passport-google-oauth20');
const cookieSession = require('cookie-session');
const { User } = require('./model/user');
const database = require('./libs/database');
const generator = require('generate-password');
const bcrypt = require('bcryptjs')

require('dotenv').config();

const PORT = 3001;

const config = {
  CLIENT_ID: process.env.CLIENT_ID,
  CLIENT_SECRET: process.env.CLIENT_SECRET,
  COOKIE_KEY_1: process.env.COOKIE_KEY_1,
  COOKIE_KEY_2: process.env.COOKIE_KEY_2,
};

const AUTH_OPTIONS = {
  callbackURL: '/auth/google/callback',
  clientID: config.CLIENT_ID,
  clientSecret: config.CLIENT_SECRET,
};

const verifyCallback = async(accessToken, refreshToken, profile, done) => {
  User.findOne({googleId: profile.id}).then((currentUser)=>{
    if(currentUser){
      // console.log('user is: ' + currentUser);
      done(null, currentUser);
    } else {
      const password = generator.generate({
        length: 10,
        numbers: true
      });  
      const passwordHash = bcrypt.hashSync(password, 10);
      new User({
        googleId: profile.id,
        displayName: profile.displayName,
        passwordHash
      }).save().then((newUser)=> {
          // console.log('New DataBase is created '+ newUser)
          done(null, newUser, res.password);
      }).catch((err)=>{
        console.log(err)
      })
    }
  })
}

passport.use(new Strategy(AUTH_OPTIONS, verifyCallback));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  done(null, id);
});

const app = express();

app.use(helmet());

app.use(cookieSession({
  name: 'session',
  maxAge: 24 * 60 * 60 * 1000,
  keys: [ config.COOKIE_KEY_1, config.COOKIE_KEY_2 ],
}));
app.use(passport.initialize());
app.use(passport.session());

function checkLoggedIn(req, res, next) { 
  console.log('Current user is:', req.user);
  const isLoggedIn = req.isAuthenticated() && req.user;
  if (!isLoggedIn) {
    return res.status(401).json({
      error: 'You must log in!',
    });
  }
  next();
}

app.get('/auth/google', 
  passport.authenticate('google', {
    scope: ['profile'], 
  }));

app.get('/auth/google/callback', 
  passport.authenticate('google', {
    failureRedirect: '/failure',
    successRedirect: '/',
    session: true,
  }), 
  passport.authenticate('local', function(err, user, info) {
    if (err) { return next(err); }
    if (!user) { return res.redirect('/login'); }
    req.logIn(user, function(err) {
      console.log('user', user)
      if (err) { return next(err); }
      return res.redirect('/users/' + user.username);
    });
  }),
  (req, res) => {
    console.log('res', res)
    res.send('something');
  }
);

app.get('/auth/logout', (req, res) => {
  req.logout(); //Removes req.user and clears any logged in session
  return res.redirect('/');
});

app.get('/secret', checkLoggedIn, (req, res) => {
  return res.send('Your personal secret value is 42!');
});

app.get('/failure', (req, res) => {
  return res.send('Failed to log in!');
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

https.createServer({
  key: fs.readFileSync('key.pem'),
  cert: fs.readFileSync('cert.pem'),
}, app).listen(PORT, () => {
  console.log(`Listening on port ${PORT}...`);
});
