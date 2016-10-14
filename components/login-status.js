import { h } from 'preact';
import {Logout} from './user';
import BoundComponent from './bound-component';

export default class LoginStatus extends BoundComponent {
  constructor() {
    super();
    this.leaderboardFormAction = '/update-me.json';
    this.state = {
      leaderboardPending: false
    };
  }
  async onLeaderboardChange(event) {
    this.setState({leaderboardPending: true});

    try {
      const response = await fetch(this.leaderboardFormAction, {
        method: 'POST',
        credentials: 'include',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({appearOnLeaderboard: event.target.checked})
      });
      
      const user = await response.json();
      this.props.onUserUpdate(user);
    }
    catch (err) {
      // TODO: toast?
      console.error(err);
    }
    this.setState({leaderboardPending: false});
  }
  render({user, onLogout, server}, {leaderboardPending}) {
    if (!user) {
      return (<div>Not logged in</div>);
    }

    let leaderboardToggle;

    if (!server) {
      leaderboardToggle = <form action={this.leaderboardFormAction} method="POST">
        <label>
          <input 
            type="checkbox"
            name="appear-on-leaderboard"
            onChange={this.onLeaderboardChange}
            checked={user.appearOnLeaderboard}
            disabled={leaderboardPending}
          />
          Appear on leaderboard
        </label>
      </form>;
    }

    return (
      <div>
        <img src={user.avatarUrl}/> Logged in as {user.name} <Logout onLogout={onLogout}/>
        {leaderboardToggle}
      </div>
    );
  }
}

LoginStatus.defaultProps = {
  onUserUpdate: function(){}
};