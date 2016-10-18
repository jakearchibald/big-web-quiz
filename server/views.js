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
import indexTemplate from './templates/index';
import {h} from 'preact';
import render from 'preact-render-to-string';

import mongoose from './mongoose-db';
import App from './shared/components/app';
import {simpleUserObject} from './user/views';
import {quiz} from './quiz/views';
import {escapeJSONString} from './utils';
import {longPollers} from './long-pollers/views';

function getInitialState(req) {
  const initialState = {
    checkedLogin: true,
    user: null
  };

  if (req.user) {
    initialState.user = simpleUserObject(req.user);
  }

  if (longPollers.lastMessageTime) {
    initialState.lastMessageTime = longPollers.lastMessageTime; 
    Object.assign(initialState, quiz.getState());
  }

  return initialState;
}

export function initialStateJson(req, res) {
  res.json(getInitialState(req));
}

export function home(req, res) {
  const initialState = getInitialState(req);
  const content = render(<App initialState={initialState} server={true} />);
  
  res.send(
    indexTemplate({
      content,
      scripts: ['/static/js/main.js'],
      css: ['/static/css/index.css'],
      initialState: escapeJSONString(JSON.stringify(initialState)) 
    })
  );
}

export function admin(req, res) {
  res.send(
    indexTemplate({
      scripts: ['/static/js/admin.js'],
      css: ['/static/css/admin.css']
    })
  );
}

export function dbJson(req, res) {
  const output = {};
  const promises = [];

  for (const name of mongoose.connection.modelNames()) {
    const modelOutput = {};
    const model = mongoose.connection.model(name);
    modelOutput.schema = model.schema;
    promises.push(
      model.find().then(docs => {
        modelOutput.docs = docs;
      })
    );
    output[name] = modelOutput;
  }

  Promise.all(promises).then(() => {
    res.json(output);
  });
}