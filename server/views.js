import indexTemplate from './templates/index';
import { h, Component } from 'preact';
import render from 'preact-render-to-string';

import {Login, Logout} from './components/user';

export function home(req, res) {
  const content = render(
    <div>
      {req.user ? <Logout/> : <Login/>}
      {req.user ? ` Logged in as ${req.user.name}` : ''}
    </div>
  );

  res.send(
    indexTemplate({content})
  );
}