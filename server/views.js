import indexTemplate from './templates/index';
import {h} from 'preact';
import render from 'preact-render-to-string';

import App from './components/app';
import {simpleUserObject} from './user/views';
import {escapeJSONString} from './utils';

export function home(req, res) {
  const initialState = {
    checkedLogin: true,
    user: null
  };

  if (req.user) {
    initialState.user = simpleUserObject(req.user);
  }

  const content = render(<App user={initialState.user}/>);
  
  res.send(
    indexTemplate({
      content,
      initialState: escapeJSONString(JSON.stringify(initialState))
    })
  );
}