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

const UPDATE_USER_FORM_ACTION = '/update-me.json';

export default class LoginStatus extends BoundComponent {
  constructor() {
    super();

    this.state = {
      leaderboardPending: false,
      bubbleOpen: false
    };
  }
  async onLeaderboardChange(event) {
    this.setState({leaderboardPending: true});

    try {
      const response = await fetch(UPDATE_USER_FORM_ACTION, {
        method: 'POST',
        credentials: 'include',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({appearOnLeaderboard: event.target.checked})
      });
      
      const data = await response.json();

      if (data.err) throw Error(data.err);

      this.props.onUserUpdate(data.user);
    }
    catch (err) {
      // TODO: toast?
      throw err;
    }
    this.setState({leaderboardPending: false});
  }
  onAvatarClick(event) {
    this.setState({
      bubbleOpen: !this.state.bubbleOpen 
    });
  }
  onWindowClick(event) {
    if (!this.state.bubbleOpen || event.target.closest('.login-details-button') || event.target.closest('.login-bubble')) return;

    this.setState({
      bubbleOpen: false
    });
  }
  componentDidMount() {
    window.addEventListener('click', this.onWindowClick);
  }
  componentWillUnmount() {
    window.removeEventListener('click', this.onWindowClick);
  }
  render({user, onLogout, server}, {leaderboardPending, bubbleOpen}) {
    if (!user) {
      return (<div>Not logged in</div>);
    }

    let leaderboardToggle;

    if (!server) {
      leaderboardToggle = (
        <form action={UPDATE_USER_FORM_ACTION} method="POST">
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
        </form>
      );
    }

    return (
      <div class="login-status">
        <button onClick={this.onAvatarClick} class="login-details-button">
          <img
            class="avatar"
            width="34" height="34"
            src={`${user.avatarUrl}?sz=34`}
            srcset={`${user.avatarUrl}?sz=68 2x, ${user.avatarUrl}?sz=136 3x`}
          />
        </button>
        <div class={`login-bubble ${bubbleOpen ? 'active' : ''}`}>
          <div class="login-bubble-hider">
            <div class="login-bubble-frame">
              <div class="login-bubble-profile">
                <div class="user-name">{user.name}</div>
                <div class="user-email">{user.email}</div>
                <div class="score">Score: {user.score}</div>
                {leaderboardToggle}
              </div>
              <Logout onLogout={onLogout}/>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

LoginStatus.defaultProps = {
  onUserUpdate: function(){}
};