import { h } from 'preact';
import BoundComponent from './bound-component';

export class Login extends BoundComponent {
  constructor() {
    super();
  }
  render() {
    return (<form action="/login" method="POST"><button>Log in</button></form>);
  }
}

export class Logout extends BoundComponent {
  constructor() {
    super();
    this.logoutUrl = '/logout';
  }
  onSubmit(event) {
    event.preventDefault();

    fetch(this.logoutUrl + '.json', {
      method: 'POST',
      credentials: 'include'
    }).then(() => {
      this.props.onLogout();
    });
  }
  render(props, state) {
    return ( 
      <form action={this.logoutUrl} method="POST" onSubmit={this.onSubmit}>
        <button>Log out</button>
      </form>
    );
  }
}

Logout.defaultProps = {
  onLogout: function(){}
};