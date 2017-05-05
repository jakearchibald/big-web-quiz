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

import url from 'url';

import express from 'express';
import session from 'express-session';
import gzipStatic from 'connect-gzip-static';
import bodyParser from 'body-parser';
import multer from 'multer';
import cors from 'cors';

import {
  home, admin, dbJson, initialStateJson, presentation,
  dbSetJson
} from './views';
import {
  userMiddleware, generateAuthUrl, handleLogin, 
  login, logoutRedirect, logoutJson, userJson, 
  updateUser, requiresLogin, requiresLoginJson, requiresAdminHtml,
  requiresAdminJson, questionAnswerJson, deleteUserAnswersJson,
  deleteUsersJson, getTopUsersJson, setLeaderboardBanJson,
  allowNaiveLogin, disallowNaiveLogin, naiveLogin
} from './user/views';
import {
  adminStateJson, updateQuestionJson, deleteQuestionJson,
  setQuestionJson, closeQuestionJson, revealQuestionJson,
  deactivateQuestionJson, presentationListen,
  showLeaderboardJson, hideLeaderboardJson,
  liveResultsQuestionJson, showVideoJson,
  showBlackoutJson, hideBlackoutJson, setEndScreen
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

['presentation-sw.js'].forEach(jsUrl => {
  router.use(
    `/${jsUrl}`,
    gzipStatic(__dirname + `/static/js/${jsUrl}`, {
      maxAge: 0
    })
  );
});

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
router.get('/presentation/', requiresAdminHtml, presentation);
router.get('/presentation/listen', requiresAdminJson, presentationListen);

router.post('/logout', logoutRedirect);
router.post('/logout.json', logoutJson);
router.post('/login', login);
router.post('/naive-login', naiveLogin);
router.post('/update-me.json', requiresLoginJson, updateUser);
router.post('/question-answer.json', requiresLoginJson, questionAnswerJson);

const adminRouter = express.Router({
  caseSensitive: true,
  strict: true
});
const adminCors = cors({
  origin: (origin, cb) => {
    if (!origin) {
      cb(null, false);
      return;
    }
    const u = url.parse(origin);
    cb(null, u.hostname == 'localhost' || u.hostname == '127.0.0.1');
  },
  maxAge: 60 * 60 * 24,
  allowedHeaders: ['Content-Type'],
  credentials: true
});

adminRouter.use(adminCors, requiresAdminJson);

adminRouter.post('/admin/question-update.json', updateQuestionJson);
adminRouter.post('/admin/question-delete.json', deleteQuestionJson);
adminRouter.post('/admin/question-activate.json', setQuestionJson);
adminRouter.post('/admin/question-show-live-results.json', liveResultsQuestionJson);
adminRouter.post('/admin/question-close.json', closeQuestionJson);
adminRouter.post('/admin/question-reveal.json', revealQuestionJson);
adminRouter.post('/admin/question-deactivate.json', deactivateQuestionJson);
adminRouter.post('/admin/delete-user-answers.json', deleteUserAnswersJson);
adminRouter.post('/admin/delete-users.json', deleteUsersJson);
adminRouter.post('/admin/show-leaderboard.json', showLeaderboardJson);
adminRouter.post('/admin/hide-leaderboard.json', hideLeaderboardJson);
adminRouter.post('/admin/show-blackout.json', showBlackoutJson);
adminRouter.post('/admin/hide-blackout.json', hideBlackoutJson);
adminRouter.post('/admin/allow-naive-login.json', allowNaiveLogin);
adminRouter.post('/admin/disallow-naive-login.json', disallowNaiveLogin);
adminRouter.post('/admin/show-video.json', showVideoJson);
adminRouter.post('/admin/db.json', dbSetJson);
adminRouter.post('/admin/set-leaderboard-ban.json', setLeaderboardBanJson);
adminRouter.post('/admin/set-end-screen.json', setEndScreen);

router.use(adminRouter);
app.use(router);

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server up on port ${port}`);
});