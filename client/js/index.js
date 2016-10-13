import {h, render, Component} from 'preact';
import regeneratorRuntime from 'regenerator-runtime/runtime';

import {Login, Logout} from '../../components/user';

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      checkedLogin: false,
      user: null
    };

    this.onLogout = this.onLogout.bind(this);
    this.onLoginClick = this.onLoginClick.bind(this);

    // get login state
    (async () => {
      const response = await fetch('/me.json', {
        credentials: 'include'
      });
      const json = await response.json();
      this.setState({
        checkedLogin: true,
        user: json.user
      });
    })();
  }
  onLogout() {
    this.setState({
      user: null
    });
  }
  onLoginClick(event) {
    event.preventDefault();
    console.log('Login clicked');
  }
  render(props, state) {
    if (!state.checkedLogin) {
      return <div></div>;
    }
    return (
      <div>
        {state.user ? <Logout onLogout={this.onLogout} /> : <Login/>}
        {state.user ? ` Logged in as ${state.user.name}` : ''}
      </div>
    );
  }
}

document.body.innerHTML = '';
render(<App/>, document.body);