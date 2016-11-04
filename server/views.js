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
import fs from 'fs';

import {h} from 'preact';
import render from 'preact-render-to-string';

import promisify from './promisify';
import indexTemplate from './templates/index';
import mongoose from './mongoose-db';
import App from './shared/components/app';
import {simpleUserObject} from './user/views';
import {quiz} from './quiz/views';
import {escapeJSONString} from './utils';
import {longPollers} from './long-pollers/views';

const readFile = promisify(fs, 'readFile');
const revManifest = readFile(`${__dirname}/static/rev-manifest.json`)
  .then(str => JSON.parse(str)).catch(() => ({}));

async function getStaticUrl(url) {
  const slicedUrl = url.slice('/static/'.length);
  const manifest = await revManifest;
  if (manifest[slicedUrl]) {
    return '/static/' + manifest[slicedUrl];
  }
  return url;
}

function getInitialState(req) {
  const initialState = {
    user: null
  };

  if (req.user) {
    initialState.user = simpleUserObject(req.user);
  }

  if (longPollers.lastMessageTime) {
    initialState.lastMessageTime = longPollers.lastMessageTime;
    Object.assign(initialState, quiz.getState());
  }

  if (quiz.activeQuestion && req.user) {
    const userAnswers = req.user.answers
      .find(a => a.questionId.equals(quiz.activeQuestion._id));
    
    if (userAnswers) {
      initialState.answersSubmitted = quiz.activeQuestion.answers
        .map((_, i) => userAnswers.choices.includes(i));
    }
    else {
      initialState.answersSubmitted = [];
    }
  }

  return initialState;
}

export function initialStateJson(req, res) {
  res.json(getInitialState(req));
}

let cachedLoggedOutView;

export async function home(req, res) {
  const initialState = getInitialState(req);
  let content;

  if (!initialState.user) {
    if (!cachedLoggedOutView) {
      cachedLoggedOutView = render(<App initialState={initialState} server={true} />);
    }
    content = cachedLoggedOutView;
  }
  else {
    content = render(<App initialState={initialState} server={true} />);
  }

  const scripts = Promise.all(['/static/js/main.js'].map(getStaticUrl));
  const css = Promise.all(['/static/css/index.css'].map(getStaticUrl));

  res.send(
    indexTemplate({
      content,
      title: 'The Big Web Quiz!',
      scripts: await scripts,
      css: await css,
      initialState: escapeJSONString(JSON.stringify(initialState))
    })
  );
}

export async function admin(req, res) {
  const scripts = Promise.all(['/static/js/admin.js'].map(getStaticUrl));
  const css = Promise.all(['/static/css/admin.css'].map(getStaticUrl));

  res.send(
    indexTemplate({
      title: 'BWQ admin',
      scripts: await scripts,
      css: await css
    })
  );
}

export async function presentation(req, res) {
  const scripts = Promise.all(['/static/js/presentation.js'].map(getStaticUrl));
  const css = Promise.all(['/static/css/presentation.css'].map(getStaticUrl));

  res.send(
    indexTemplate({
      title: 'BWQ presentation',
      scripts: await scripts,
      css: await css
    })
  );
}

export function dbJson(req, res) {
  const output = {};
  const promises = [];
  const types = req.query.types;

  if (!types || !Array.isArray(types)) {
    res.json({err: 'No type set'});
    return;
  }

  const names = mongoose.connection.modelNames();

  for (const name of types) {
    if (!names.includes(name)) {
      res.json({err: `Type "${name}" unknown`});
      return;
    }
  }

  for (const name of types) {
    const model = mongoose.connection.model(name);
    promises.push(
      model.find().then(docs => {
        output[name] = docs;
      })
    );
  }

  Promise.all(promises).then(() => {
    res.json(output);
  }).catch(err => {
    res.status(500).json({err: err.message});
    throw err;
  });
}

export function dbSetJson(req, res) {
  const promises = [];

  for (const key of Object.keys(req.body)) {
    const model = mongoose.connection.model(key);
    promises.push(
      model.remove({}).then(() => model.insertMany(req.body[key]))
    );
  }

  Promise.all(promises).then(() => {
    res.json({ok: true});
  }).catch(err => {
    res.status(500).json({err: err.message});
    throw err;
  });
}