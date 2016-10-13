import 'source-map-support/register';

import express from 'express';
import session from 'express-session';
import {home} from './views';
import {userMiddleware, generateAuthUrl, handleLogin, logout, login} from './user/views';
import mongoose from './mongoose-db';
import connectMongo from 'connect-mongo';
const MongoStore = connectMongo(session);

import {cookieSecret} from './settings'; 

const app = express();

// Middleware:
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

app.use(userMiddleware);

// Routes:
app.get('/', home);
app.get('/oauth2callback', handleLogin);
app.get('/logout', logout);
app.get('/login', login);

app.listen(3000, () => {
  console.log('Example app listening on port 3000!');
});