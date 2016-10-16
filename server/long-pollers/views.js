import LongPollers from './models';

export const longPollers = new LongPollers();

export function longPoll(req, res) {
  longPollers.add(req, res);
}