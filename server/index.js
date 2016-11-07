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
import 'source-map-support/register';

import express from 'express';
import session from 'express-session';
import gzipStatic from 'connect-gzip-static';
import bodyParser from 'body-parser';
import multer from 'multer';
import {
  home, admin, dbJson, initialStateJson, presentation,
  dbSetJson
} from './views';
import {
  userMiddleware, generateAuthUrl, handleLogin, 
  login, logoutRedirect, logoutJson, userJson, 
  updateUser, requiresLogin, requiresLoginJson, requiresAdminHtml,
  requiresAdminJson, questionAnswerJson, deleteUserAnswersJson,
  deleteUsersJson, getTopUsersJson, setLeaderboardBanJson
} from './user/views';
import {
  adminStateJson, updateQuestionJson, deleteQuestionJson,
  setQuestionJson, closeQuestionJson, revealQuestionJson,
  deactivateQuestionJson, presentationListen,
  showLeaderboardJson, hideLeaderboardJson,
  liveResultsQuestionJson, showIntroJson,
  hideIntroJson
} from './quiz/views';
import {longPoll} from './long-pollers/views';
import mongoose from './mongoose-db';
import connectMongo from 'connect-mongo';
const MongoStore = connectMongo(session);

import {cookieSecret} from './settings'; 
import {production} from './utils';

const app = express();
const router = express.Router({
  caseSensitive: true,
  strict: true
});

// Middleware:
router.use(
  '/static',
  gzipStatic(__dirname + '/static', {
    maxAge: production ? 1000 * 60 * 60 * 24 * 365 : 0
  })
);

router.use(session({
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

router.use(userMiddleware);
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({
  extended: true
}));
router.use(multer().none());

// Routes:
router.get('/', home);
router.get('/check', (req, res) => res.send('OK'));
router.get('/oauth2callback', handleLogin);
router.get('/me.json', userJson);
router.get('/initial-state.json', initialStateJson);
router.get('/long-poll.json', requiresLoginJson, longPoll);
router.get('/admin/', requiresAdminHtml, admin);
router.get('/admin/initial-state.json', requiresAdminJson, adminStateJson);
router.get('/admin/top-users.json', requiresAdminJson, getTopUsersJson);
router.get('/admin/db.json', requiresAdminJson, dbJson);
router.get('/presentation/', requiresLogin, presentation);
router.get('/presentation/listen', requiresLoginJson, presentationListen);

router.post('/logout', logoutRedirect);
router.post('/logout.json', logoutJson);
router.post('/login', login);
router.post('/update-me.json', requiresLoginJson, updateUser);
router.post('/question-answer.json', requiresLoginJson, questionAnswerJson);
router.post('/admin/question-update.json', requiresAdminJson, updateQuestionJson);
router.post('/admin/question-delete.json', requiresAdminJson, deleteQuestionJson);
router.post('/admin/question-activate.json', requiresAdminJson, setQuestionJson);
router.post('/admin/question-show-live-results.json', requiresAdminJson, liveResultsQuestionJson);
router.post('/admin/question-close.json', requiresAdminJson, closeQuestionJson);
router.post('/admin/question-reveal.json', requiresAdminJson, revealQuestionJson);
router.post('/admin/question-deactivate.json', requiresAdminJson, deactivateQuestionJson);
router.post('/admin/delete-user-answers.json', requiresAdminJson, deleteUserAnswersJson);
router.post('/admin/delete-users.json', requiresAdminJson, deleteUsersJson);
router.post('/admin/show-leaderboard.json', requiresAdminJson, showLeaderboardJson);
router.post('/admin/hide-leaderboard.json', requiresAdminJson, hideLeaderboardJson);
router.post('/admin/show-intro.json', requiresAdminJson, showIntroJson);
router.post('/admin/hide-intro.json', requiresAdminJson, hideIntroJson);
router.post('/admin/db.json', requiresAdminJson, dbSetJson);
router.post('/admin/set-leaderboard-ban.json', requiresAdminJson, setLeaderboardBanJson);

app.use(router);

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server up on port ${port}`);
});