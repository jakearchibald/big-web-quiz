import 'source-map-support/register';

import express from 'express';
import session from 'express-session';
import gzipStatic from 'connect-gzip-static';
import bodyParser from 'body-parser';
import {home, admin} from './views';
import {
  userMiddleware, generateAuthUrl, handleLogin, 
  login, logoutRedirect, logoutJson, userJson, 
  updateUser, requiresLoginJson, requiresAdminHtml,
  requiresAdminJson
} from './user/views';
import {
  allQuestionsJson, updateQuestionJson, deleteQuestionJson
} from './quiz/views';
import mongoose from './mongoose-db';
import connectMongo from 'connect-mongo';
const MongoStore = connectMongo(session);

import {cookieSecret} from './settings'; 

const app = express();
const router = express.Router({
  caseSensitive: true,
  strict: true
});

// Middleware:
router.use('/static', gzipStatic(__dirname + '/static'));

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

// Routes:
router.get('/', home);
router.get('/oauth2callback', handleLogin);
router.get('/me.json', userJson);
router.get('/admin/', requiresAdminHtml, admin);
router.get('/admin/questions.json', requiresAdminHtml, allQuestionsJson);

router.post('/logout', logoutRedirect);
router.post('/logout.json', logoutJson);
router.post('/login', login);
router.post('/update-me.json', requiresLoginJson, updateUser);
router.post('/admin/question-update.json', requiresAdminJson, updateQuestionJson);
router.post('/admin/question-delete.json', requiresAdminJson, deleteQuestionJson);

app.use(router);

app.listen(3000, () => {
  console.log('Example app listening on port 3000!');
});