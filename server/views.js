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
import {naiveLoginAllowed} from './user/models';
import {simpleUserObject} from './user/views';
import {quiz} from './quiz/views';
import {escapeJSONString} from './utils';
import {longPollers} from './long-pollers/views';

const readFile = promisify(fs, 'readFile');

function getInitialState(req) {
  const initialState = {
    user: null,
    naiveLoginAllowed: naiveLoginAllowed()
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

export async function home(req, res) {
  const initialState = getInitialState(req);

  res.send(
    indexTemplate({
      content: render(<App initialState={initialState} server={true} />),
      title: 'The Big Web Quiz!',
      inlineCss: await readFile(`${__dirname}/static/css/index-inline.css`), 
      scripts: ['/static/js/main.js'],
      lazyCss: ['/static/css/index.css'],
      initialState: escapeJSONString(JSON.stringify(initialState))
    })
  );
}

export function admin(req, res) {
  res.send(
    indexTemplate({
      title: 'BWQ admin',
      scripts: ['/static/js/admin.js'],
      css: ['/static/css/admin.css']
    })
  );
}

export function presentation(req, res) {
  res.send(
    indexTemplate({
      title: 'BWQ presentation',
      scripts: ['/static/js/presentation.js'],
      css: ['/static/css/presentation.css']
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