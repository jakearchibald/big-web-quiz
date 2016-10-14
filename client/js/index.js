import {h, render} from 'preact';
import regeneratorRuntime from 'regenerator-runtime/runtime';
// so we don't have to keep importing it
self.regeneratorRuntime = regeneratorRuntime;

import {Login, Logout} from '../../components/user';
import BoundComponent from '../../components/bound-component';
import Intro from '../../components/intro';
import QuestionWaiting from '../../components/question-waiting';
import LoginStatus from '../../components/login-status';

async function getInitialState() {
  if (self.initialState) return self.initialState;

  // TODO get from IDB

  const response = await fetch('/me.json', {
    credentials: 'include'
  });
  const json = await response.json();

  return {
    checkedLogin: true,
    user: json.user
  };
}

class App extends BoundComponent {
  constructor(props) {
    super(props);
    this.state = props.initialState;
  }
  onUserUpdate(user) {
    this.setState({user});
  }
  onLogout() {
    this.setState({
      user: null
    });
  }
  render(props, {user}) {
    return (
      <div>
        <LoginStatus user={user} onLogout={this.onLogout} onUserUpdate={this.onUserUpdate}/>
        {user ? <QuestionWaiting/> : <Intro/>}
      </div>
    );
  }
}

getInitialState().then(state => {
  document.body.innerHTML = '';
  render(<App initialState={initialState}/>, document.body);
});