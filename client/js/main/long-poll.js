import EventEmitter from 'events';
import {wait} from '../utils';

export default class LongPoll extends EventEmitter {
  constructor(lastMessage) {
    super();
    this._active = false;
    this._fetchInFlight = false;
    this._lastMessage = lastMessage;
    this.start();
  }
  start() {
    this._active = true;
    if (this._fetchInFlight) return;

    const poll = async () => {
      const lastMessageTime = this._lastMessage ? this._lastMessage.time : 0;
      const connectionStart = Date.now();

      try {
        const response = await fetch(`/long-poll.json?lastMessageTime=${lastMessageTime}`, {
          credentials: 'include'
        });

        const message = await response.json();

        if (this._active) {
          this._lastMessage = message;
          this.emit('message', message);
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