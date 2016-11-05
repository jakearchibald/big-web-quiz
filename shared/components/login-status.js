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
import LeaderboardToggle from './leaderboard-toggle';

export default class LoginStatus extends BoundComponent {
  constructor() {
    super();

    this.state = {
      leaderboardPending: false,
      bubbleOpen: false
    };
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
  render({user, onLogout, server, onUserUpdate}, {leaderboardPending, bubbleOpen}) {
    if (!user) {
      return (<div class="page-header__not-logged-in">Not signed in</div>);
    }

    let leaderboardToggle;

    if (!server) {
      leaderboardToggle = (
        <LeaderboardToggle
          checked={user.optIntoLeaderboard}
          onUserUpdate={onUserUpdate}
        />
      );
    }

    return (
      <div class="login-status">
        <button onClick={this.onAvatarClick} class="login-details-button">
          <img
            class="avatar"
            width="48" height="48"
            src={`${user.avatarUrl}?sz=48`}
            srcset={`${user.avatarUrl}?sz=96 2x, ${user.avatarUrl}?sz=144 3x`}
          />
        </button>
        <div class={`login-bubble ${bubbleOpen ? 'active' : ''}`}>
          <div class="login-bubble-hider">
            <div class="login-bubble-frame">
              <div class="login-bubble-profile">
                <div class="user-name">{user.name}</div>
                <div class="user-email">{user.email}</div>
                {leaderboardToggle}
              </div>
              <div class="login-bubble-options">
                <a href="https://security.google.com/settings/security/permissions?pli=1" class="login-bubble-unregister">Disconnect</a>
                <Logout onLogout={onLogout}/>
              </div>
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