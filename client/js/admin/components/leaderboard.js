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
import BoundComponent from '../../../../shared/components/bound-component';


export default class QuestionUpdate extends BoundComponent {
  constructor(props) {
    super(props);

    this.state = {
      users: null,
      filteringType: 'opted-in-not-banned',
      updating: true
    };

    this.updateUsers();
  }
  async updateUsers() {
    this.setState({updating: true});

    try {
      const response = await fetch('/admin/top-users.json', {
        credentials: 'include'
      });
      const {users} = await response.json();
      this.setState({
        users,
        updating: false
      });
    }
    catch (err) {
      this.setState({
        updating: false
      });
      throw err;
    }
  }
  shouldComponentUpdate(nextProps, nextState) {
    return nextState != this.state;
  }
  onUpdateLeaderboard() {
    this.updateUsers();
  }
  async onBannedChange(user, ban) {
    user.bannedFromLeaderboard = ban;
    user.updating = true;

    this.setState({
      users: this.state.users.slice(),
      updating: true
    });

    try {
      const response = await fetch('/admin/set-leaderboard-ban.json', {
        method: 'POST',
        credentials: 'include',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          id: user.googleId,
          ban
        })
      });

      const data = await response.json();

      if (data.err) throw Error(data.err);

      this.setState({
        users: data.users,
        updating: false
      });
    }
    catch (err) {
      await this.updateUsers();
      throw err;
    }
  }
  render({}, {users, updating, filteringType}) {
    if (!users) return (
      <div>Loading leaderboard…</div>
    );

    if (filteringType != 'all') {
      users = users.filter(user => {
        if (!user.optIntoLeaderboard) return false;
        if (filteringType == 'opted-in-not-banned' && user.bannedFromLeaderboard) return false;
        return true;
      });
    }

    return (
      <div>
        <p>Show:</p>
        <div>
          <label>
            <input
              type="radio"
              name="leaderboard-filter-type"
              value="all"
              onChange={this.linkState('filteringType', 'target.value')}
              checked={filteringType == 'all'}
            />
            All players
          </label>
        </div>
        <div>
          <label>
            <input
              type="radio"
              name="leaderboard-filter-type"
              value="opted-in"
              onChange={this.linkState('filteringType', 'target.value')}
              checked={filteringType == 'opted-in'}
            />
            Opted-in
          </label>
        </div>
        <div>
          <label>
            <input
              type="radio"
              name="leaderboard-filter-type"
              value="opted-in-not-banned"
              onChange={this.linkState('filteringType', 'target.value')}
              checked={filteringType == 'opted-in-not-banned'}
            />
            Opted-in &amp; not banned
          </label>
        </div>
        <button onClick={this.onUpdateLeaderboard} disabled={updating}>Update leaderboard</button>
        <table class="leaderboard-table">
          <thead>
            <tr>
              <th>Pos</th> <th>Player</th> <th>Score</th> <th>Opted-in</th> <th>Banned from leaderboard</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user, i) => 
              <tr key={user.googleId}>
                <th>{i+1}</th>
                <td>
                  <img
                    width="48" height="48"
                    src={`${user.avatarUrl}?sz=48`}
                    srcset={`${user.avatarUrl}?sz=96 2x, ${user.avatarUrl}?sz=144 3x`}
                  />
                  {user.name}
                </td>
                <td>{user.score}</td>
                <td>{user.optIntoLeaderboard ? 'Yes' : 'No'}</td>
                <td>
                  <input
                    type="checkbox"
                    onChange={event => this.onBannedChange(user, event.target.checked)}
                    checked={user.bannedFromLeaderboard}
                    disabled={user.updating}
                  />
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    );
  }
}
