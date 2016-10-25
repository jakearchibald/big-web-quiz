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
import {h, render} from 'preact';
import regeneratorRuntime from 'regenerator-runtime/runtime';
import App from '../../../shared/components/app';
// for node compatibility
self.global = self;
// so we don't have to keep importing it
self.regeneratorRuntime = regeneratorRuntime;

window.load = new Promise(resolve => {
  window.addEventListener('load', () => resolve());
});

function loadScript(url) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.onload = () => resolve();
    script.onerror = () => reject();
    script.src = url;
    document.head.insertBefore(script, document.head.firstChild);
  });
}

async function getInitialState() {
  if (self.initialState) return self.initialState;

  const response = await fetch('/initial-state.json', {
    credentials: 'include'
  });

  return response.json();
}

const scriptLoading = []; 

if (!window.fetch) scriptLoading.push(loadScript('/static/js/polyfills.js'));

Promise.all(scriptLoading).then(() => getInitialState()).then(state => {
  document.body.innerHTML = '';
  render(<App initialState={state}/>, document.body);
});