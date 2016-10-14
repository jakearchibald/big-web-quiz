import 'source-map-support/register';

import express from 'express';
import session from 'express-session';
import gzipStatic from 'connect-gzip-static';
import bodyParser from 'body-parser';
import {home} from './views';
import {
  userMiddleware, generateAuthUrl, handleLogin, 
  login, logoutRedirect, logoutJson, userJson, 
  updateUser, requiresLoginJson
} from './user/views';
import mongoose from './mongoose-db';
import connectMongo from 'connect-mongo';
const MongoStore = connectMongo(session);

import {cookieSecret} from './settings'; 

const app = express();

// Middleware:
app.use('/static', gzipStatic(__dirname + '/static'));

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
app.use(bodyParser.json());

// Routes:
app.get('/', home);
app.get('/oauth2callback', handleLogin);
app.post('/logout', logoutRedirect);
app.post('/logout.json', logoutJson);
app.post('/login', login);
app.get('/me.json', userJson);
app.post('/update-me.json', requiresLoginJson, updateUser);

app.listen(3000, () => {
  console.log('Example app listening on port 3000!');
});