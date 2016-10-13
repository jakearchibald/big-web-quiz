import google from 'googleapis';

import User from './model';
import promisify from '../promisify';
import {clientId, clientSecret, redirectOrigin} from '../settings';

function getAuthClient() {
  return new google.auth.OAuth2(
    clientId,
    clientSecret,
    redirectOrigin + '/oauth2callback'
  );
}

function authenticateUser(code) {
  const oauth2Client = getAuthClient();

  return promisify(oauth2Client, 'getToken')(code).then(tokens => {
    oauth2Client.setCredentials(tokens);
    const plus = google.plus('v1');
    return promisify(plus.people, 'get')({ userId: 'me', auth: oauth2Client });
  }).then(response => {
    return User.findOneAndUpdate({googleId: response.id}, {
      googleId: response.id,
      name: response.displayName,
      email: response.emails[0].value,
      avatarUrl: response.image.url
    }, {upsert: true});
  });
}

export function generateAuthUrl() {
  const oauth2Client = getAuthClient();
  return oauth2Client.generateAuthUrl({
    scope: ['profile', 'email']
  });
}

export function userMiddleware(req, res, next) {
  if (!req.session.userId) {
    next();
    return;
  }

  User.findOne({googleId: req.session.userId}).then(user => {
    req.user = user;
    next();
  });
}

export function handleLogin(req, res) {
  authenticateUser(req.query.code).then(user => {
    req.session.userId = user.googleId;
    res.send('Authed ' + JSON.stringify(user));
  }).catch(err => {
    res.send('Auth failed');
    console.log(err);
  });
}
