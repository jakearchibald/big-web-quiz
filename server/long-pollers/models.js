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
export default class LongPollers {
  constructor() {
    this._pollers = []; // [{req, res}]
    this._lastMessage = null;
  }
  get lastMessage() {
    return this._lastMessage;
  }
  get lastMessageTime() {
    return this._lastMessage ? this._lastMessage.time : 0;
  }
  broadcast(message) {
    this._lastMessage = {
      message,
      time: Date.now()
    };

    for (const poller of this._pollers) {
      try {
        poller.res.json(this._lastMessage);
      }
      catch (err) {
        console.log(err);
      }
    }
  }
  countPollersForUser(user) {
    return this._pollers
      .filter(poll => poll.req.user.equals(user)).length;
  }
  add(req, res) {
    const queryMessageTime = Number(req.query.lastMessageTime) || 0;
    const lastMessageTime = this.lastMessageTime;

    if (queryMessageTime != lastMessageTime) {
      res.json(this._lastMessage);
      return;
    }

    // Allowing admin to make too many connections for testing purposes
    if (!req.user.isAdmin() && this.countPollersForUser(req.user) > 10) {
      res.status(429).json({err: 'Too many open polling requests'});
      return;
    }

    this._pollers.push({req, res});

    const connectionEnded = () => {
      res.removeListener('finish', connectionEnded);
      res.removeListener('close', connectionEnded);

      // remove from the pool
      const index = this._pollers.findIndex(poll => poll.res == res);

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
