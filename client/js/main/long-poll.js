import EventEmitter from 'events';
import {wait} from '../utils';

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