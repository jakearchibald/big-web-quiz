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
import {h} from 'preact';
import BoundComponent from './bound-component';

const UPDATE_USER_FORM_ACTION = '/update-me.json';

export default class LeaderboardToggle extends BoundComponent {
  constructor(props) {
    super(props);

    this.state = {
      leaderboardPending: false,
      checked: props.checked
    };
  }
  componentWillReceiveProps(props) {
    this.setState({
      checked: props.checked
    });
  }
  async onLeaderboardChange(event) {
    this.setState({
      leaderboardPending: true,
      checked: event.target.checked
    });

    try {
      const response = await fetch(UPDATE_USER_FORM_ACTION, {
        method: 'POST',
        credentials: 'include',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({optIntoLeaderboard: event.target.checked})
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
  render(props, {leaderboardPending, checked}) {
    return (
      <form class="leaderboard-toggle" action={UPDATE_USER_FORM_ACTION} method="POST">
        <label>
          <input
            type="checkbox"
            class="leaderboard-toggle__input"
            name="appear-on-leaderboard"
            onChange={this.onLeaderboardChange}
            checked={checked}
            disabled={leaderboardPending}
          />
          <span class="leaderboard-toggle__description">Appear on leaderboard</span>
        </label>
      </form>
    );
  }
}

LeaderboardToggle.defaultProps = {
  onUserUpdate: function(){}
};