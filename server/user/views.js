import google from 'googleapis';

import {User} from './models';
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

function logout(req) {
  return new Promise(r => req.session.destroy(r));
}

const ADMIN_IDS = [
  '116237864387312784020' // Jake
];

function requiresAdmin(req) {
  if (!req.user) {
    return "Login required";
  }

  if (!ADMIN_IDS.includes(req.user.googleId)) {
    res.status(403).send("Admin only, soz");
    return "Admin only, soz";
  }

  return "";
}

export function generateAuthUrl({
  state = ''
}={}) {
  const oauth2Client = getAuthClient();
  return oauth2Client.generateAuthUrl({
    scope: ['profile', 'email'],
    state
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
    res.redirect(req.query.state);
  }).catch(err => {
    res.send('Auth failed');
    console.log(err);
  });
}

export function simpleUserObject(user) {
  return {
    name: user.name,
    avatarUrl: user.avatarUrl,
    appearOnLeaderboard: !!user.appearOnLeaderboard 
  }
}

export function userJson(req, res) {
  if (!req.user) {
    res.json({
      user: null 
    });
    return;
  }

  res.json({
    user: simpleUserObject(req.user)
  });
}

export function logoutRedirect(req, res) {
  logout(req).then(() => {
    res.redirect('/');
  });
}

export function logoutJson(req, res) {
  logout(req).then(() => {
    res.json({done: true});
  });
}

export function login(req, res) {
  res.redirect(generateAuthUrl({
    state: req.get('referrer')
  }));
}

export function updateUser(req, res) {
  // only dealing with appearOnLeaderboard for now
  if (!('appearOnLeaderboard' in req.body)) {
    res.json(simpleUserObject(req.user));
    return;
  }

  req.user.appearOnLeaderboard = !!req.body.appearOnLeaderboard;
  req.user.save().then(newUser => {
    res.json(simpleUserObject(newUser));
  }).catch(err => {
    res.status(500).json({err: 'Update failed'})
    throw err;
  });
}

const adminIds = [
  '116237864387312784020' // Jake
];

export function requiresAdminHtml(req, res, next) {
  const err = requiresAdmin(req);

  if (err) {
    res.status(403).send(err);
    return;
  }

  next();
}

export function requiresAdminJson(req, res, next) {
  const err = requiresAdmin(req);

  if (err) {
    res.status(403).json({err});
    return;
  }

  next();
}

export function requiresLoginJson(req, res, next) {
  if (!req.user) {
    res.status(403).json({err: "Not logged in"});
    return;
  }

  next();
}