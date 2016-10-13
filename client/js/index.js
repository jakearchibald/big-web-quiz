import {h, render} from 'preact';
import regeneratorRuntime from 'regenerator-runtime/runtime';

import {Login, Logout} from '../../components/user';
import BoundComponent from '../../components/bound-component';

class App extends BoundComponent {
  constructor(props) {
    super(props);

    this.state = {
      checkedLogin: false,
      user: null
    };

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