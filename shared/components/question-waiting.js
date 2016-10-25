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
import BoundComponent from './bound-component';
import LeaderboardToggle from './leaderboard-toggle';

export default class QuestionWaiting extends BoundComponent {
  render({server, onUserUpdate, user}) {
    return (
      <div class="question-waiting">
        <div class="your-score">
          <div class="your-score__title">Your score:</div>
          <div class="your-score__value">{user.score}</div>
        </div>

        <p class="message">Waiting for a question</p>
        {!server &&
          <LeaderboardToggle
            onUserUpdate={onUserUpdate}
            checked={user.appearOnLeaderboard}
          />
        }
      </div>
    );
  }
}

QuestionWaiting.defaultProps = {
  onUserUpdate: function(){}
};