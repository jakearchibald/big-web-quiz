import 'source-map-support/register';
import express from 'express';
import session from 'express-session';
import {User, generateAuthUrl, authenticateUser} from './user';
import mongoose from './mongoose-db';
import connectMongo from 'connect-mongo';
const MongoStore = connectMongo(session);

import google from 'googleapis';
import {cookieSecret} from './settings'; 

const app = express();

const OAuth2 = google.auth.OAuth2;
const plus = google.plus('v1');

app.use(session({
  secret: cookieSecret,
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 * 365
  },
  store: new MongoStore({
    mongooseConnection: mongoose.connection,
    touchAfter: 24 * 3600
  })
}));

// user middleware
app.use((req, res, next) => {
  if (!req.session.userId) {
    next();
    return;
  }

  User.findOne({googleId: req.session.userId}).then(user => {
    req.user = user;
    next();
  });
});

app.get('/', (req, res) => {
  if (req.user) {
    res.send(`Logged in as ${req.user.name}`);
    return;
  }

  res.send(`Log in: ${generateAuthUrl()}`);
});

app.get('/oauth2callback', (req, res) => {
  authenticateUser(req.query.code).then(user => {
    req.session.userId = user.googleId;
    res.send('Authed ' + JSON.stringify(user));
  }).catch(err => {
    res.send('Auth failed');
    console.log(err);
  });
});

app.listen(3000, () => {
  console.log('Example app listening on port 3000!');
});