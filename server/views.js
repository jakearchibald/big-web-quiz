import indexTemplate from './templates/index';
import {h} from 'preact';
import render from 'preact-render-to-string';

import App from './components/app';
import {simpleUserObject} from './user/views';

export function home(req, res) {
  const initialState = {
    checkedLogin: true,
    user: null
  };

  if (req.user) {
    initialState.user = simpleUserObject(req.user);
  }

  // TODO: is this enough escaping?
  const initialStateEncoded = JSON.stringify(initialState).replace(/\//g, '\\/');

  const content = render(<App user={initialState.user}/>);
  
  res.send(
    indexTemplate({
      content,
      initialState: initialStateEncoded
    })
  );
}