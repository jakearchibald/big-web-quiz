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
import EventEmitter from 'events';
import {wait} from './utils';

export default class LongPoll extends EventEmitter {
  constructor(lastMessageTime = 0) {
    super();
    this._active = false;
    this._fetchInFlight = false;
    this._lastMessageTime = lastMessageTime;
    this._visible = false;

    this._updateVisibility();
    this.start();

    document.addEventListener('visibilitychange', () => {
      this._updateVisibility();
      this._poll();
    });
  }
  _updateVisibility() {
    this._visible = document.visibilityState == 'visible';
  }
  async _poll() {
    if (this._fetchInFlight || !this._active || !this._visible) return;
    this._fetchInFlight = true;
    const connectionStart = Date.now();

    try {
      const response = await fetch(`/long-poll.json?lastMessageTime=${this._lastMessageTime}`, {
        credentials: 'include'
      });

      const data = await response.json();

      if (this._active) {
        this._lastMessageTime = data.time;
        this.emit('message', data.message);
      }
    }
    catch(err) {
      console.log('Poll error', err);
    }

    const connectionEnd = Date.now();

    if (connectionEnd - connectionStart < 3000) {
      await wait(3000 - (connectionEnd - connectionStart));
    }

    this._fetchInFlight = false;
    this._poll();
  }
  start() {
    this._active = true;
    this._poll();
  }
  stop() {
    this._active = false;
  }
}