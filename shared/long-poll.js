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
    this.start();
  }
  start() {
    this._active = true;
    if (this._fetchInFlight) return;

    const poll = async () => {
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

      if (!this._active) {
        this._fetchInFlight = false;
        return;
      }

      const connectionEnd = Date.now();

      if (connectionEnd - connectionStart < 3000) {
        await wait(3000 - (connectionEnd - connectionStart));
      }

      poll();
    }

    poll();
  }
  stop() {
    this._active = false;
  }
}