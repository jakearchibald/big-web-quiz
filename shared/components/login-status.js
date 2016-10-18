/**
*
* Copyright 2016 Google Inc. All rights reserved.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*     http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/
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
        <div>Score: {user.score}</div>
      </div>
    );
  }
}

LoginStatus.defaultProps = {
  onUserUpdate: function(){}
};