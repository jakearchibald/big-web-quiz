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

import {wait} from '../shared/utils';

function writeMessage(res, id, data) {
  res.write(`id: ${id}\n`);
  res.write(`data: ${data}\n\n`);
}

export default class EventStream {
  constructor() {
    this._pollers = []; // [{req, res}]
    this._lastEventId = 0;
    this._lastMessage = null;
    this._rollingState = {};
    this._waitingForThrottledSend = false;
    this._throttleMessage = null;
  }
  broadcast(message) {
    Object.assign(this._rollingState, message);
    this._lastMessage = message;
    this._lastEventId++;

    const messageStr = JSON.stringify(this._lastMessage);

    for (const poller of this._pollers) {
      try {
        writeMessage(poller.res, this._lastEventId, messageStr);
      }
      catch (err) {
        console.log(err);
      }
    }
  }
  async broadcastThrottled(message) {
    this._throttleMessage = message;
    if (this._waitingForThrottledSend) return;
    this._waitingForThrottledSend = true;
    await wait(300);
    this.broadcast(this._throttleMessage);
    this._waitingForThrottledSend = false;
  }
  countListenersForUser(user) {
    return this._pollers
      .filter(poll => poll.req.user.equals(user)).length;
  }
  add(req, res) {
    const lastEventId = Number(req.get('Last-Event-ID')) || 0;

    // Allowing admin to make too many connections for testing purposes
    if (!req.user.isAdmin() && this.countListenersForUser(req.user) > 10) {
      res.status(429).json({err: 'Too many open polling requests'});
      return;
    }

    res.set('Content-Type', "text/event-stream");
    res.write('retry: 1000\n');

    if (lastEventId != this._lastEventId) {
      const message = JSON.stringify(this._rollingState);
      writeMessage(res, this._lastEventId, message);
    }

    this._pollers.push({req, res});

    const connectionEnded = () => {
      res.removeListener('finish', connectionEnded);
      res.removeListener('close', connectionEnded);

      // remove from the pool
      const index = this._pollers.findIndex(poller => poller.res == res);

      if (index != -1) {
        this._pollers.splice(index, 1);
      }
    };

    // connected closed after response
    res.on('finish', connectionEnded);
    // connected closed before response
    res.on('close', connectionEnded);
  }
}
