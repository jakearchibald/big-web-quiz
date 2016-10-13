import { h, Component } from 'preact';

export class Login extends Component {
  constructor() {
    super();
  }
  render(props, state) {
    return (<a href="/login">Log in</a>);
  }
}

export class Logout extends Component {
  constructor() {
    super();
    this.logoutUrl = '/logout';
    this.onClick = this.onClick.bind(this);
  }
  async onClick(event) {
    event.preventDefault();

    const response = await fetch(this.logoutUrl + '.json', {
      credentials: 'include'
    });
    
    this.props.onLogout();
  }
  render(props, state) {
    return (<a href={this.logoutUrl}  onClick={this.onClick}>Log out</a>);
  }
}

Logout.defaultProps = {
  onLogout: function(){}
};