export default class LongPollers {
  constructor() {
    this._pollers = [];
    this._lastMessage = null;
  }
  get lastMessage() {
    return this._lastMessage;
  }
  broadcast(message) {
    this._lastMessage = {
      message,
      time: Date.now()
    };

    for (const res of this._pollers) {
      res.json(this._lastMessage);
    }
  }
  add(req, res) {
    const queryMessageTime = Number(req.query.lastMessageTime) || 0;
    const lastMessageTime = this._lastMessage ? this._lastMessage.time : 0;

    if (queryMessageTime < lastMessageTime) {
      res.json(this._lastMessage);
      return;
    }

    this._pollers.push(res);

    const connectionEnded = () => {
      res.removeListener('finish', connectionEnded);
      res.removeListener('close', connectionEnded);

      // remove from the pool
      const index = this._pollers.indexOf(res);

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
