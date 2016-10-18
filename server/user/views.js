/**
*
* Copyright 2016 Google Inc. All rights reserved.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*     http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/
import google from 'googleapis';

import {User} from './models';
import {Question} from '../quiz/models';
import {quiz} from '../quiz/views';
import {longPollers} from '../long-pollers/views';
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
    console.log('in final then');
    return User.findOneAndUpdate({googleId: response.id}, {
      googleId: response.id,
      name: response.displayName,
      email: response.emails[0].value,
      avatarUrl: response.image.url
    }, {upsert: true, new: true});
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
    appearOnLeaderboard: !!user.appearOnLeaderboard,
    score: user.score,
    agreedToTerms: user.agreedToTerms
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
    res.json({
      user: simpleUserObject(newUser)
    });
  }).catch(err => {
    res.status(500).json({err: 'Update failed'})
    throw err;
  });
}

export function userAgreeTerms(req, res) {
  req.user.agreedToTerms = true;
  req.user.save().then(newUser => {
    res.json({
      user: simpleUserObject(newUser)
    });
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

export function requiresLogin(req, res, next) {
  if (req.params.json) {
    return requiresLoginJson(req, res, next);
  }

  if (!req.user) {
    res.status(403).send("Not logged in");
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

export function deleteUserAnswersJson(req, res) {
  User.update({}, {answers: [], score: 0}).then(() => {
    res.json({});
  }).catch(err => {
    res.status(500).json({err});
  });
}

export function deleteUsersJson(req, res) {
  User.remove({}).then(() => {
    longPollers.broadcast({user: null});
    res.json({});
  }).catch(err => {
    res.status(500).json({err});
  });
}

export function questionAnswerJson(req, res) {
  if (!quiz.activeQuestion) {
    res.json({err: "No question being asked"});
    return;
  }

  Question.findById(req.body.id).then(question => {
    if (!question) {
      res.json({err: "Question not found"});
      return;
    }

    if (!question._id.equals(quiz.activeQuestion._id)) {
      res.json({err: "This question isn't currently being asked"});
      return;
    }

    if (!quiz.acceptingAnswers) {
      res.json({err: "Too late!"});
      return;
    }

    if (!Array.isArray(req.body.choices)) {
      res.json({err: "Choices is wrong type"});
      return;
    }

    // filter out bad answers and make unique
    const choices = [...new Set(
      req.body.choices.filter(choice => {
        // remove non-numbers
        if (typeof choice != 'number') return false;
        // remove out-of-range numbers
        if (choice < 0 || choice > quiz.activeQuestion.answers.length - 1) return false;
        return true;
      })
    )];

    if (!quiz.activeQuestion.multiple && choices.length != 1) {
      res.json({err: "Must provide one answer"});
      return;
    }

    const answerIndex = req.user.answers.findIndex(a => a.questionId.equals(question._id));

    if (answerIndex != -1) {
      req.user.answers[answerIndex].choices = choices;
    }
    else {
      req.user.answers.push({questionId: question._id, choices});
    }
    return req.user.save();
  }).then(() => {
    res.json({});
  }).catch(err => {
    res.status(500).json({err: "Unknown error"});
    throw err;
  });
}