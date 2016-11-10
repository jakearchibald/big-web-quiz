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
          <p class="message">Waiting for a question</p>
        </div>

        {!server &&
          (<div class="question-waiting__leaderboard">
            <LeaderboardToggle
              onUserUpdate={onUserUpdate}
              checked={user.optIntoLeaderboard}
            />
            <div class="question-waiting__leaderboard-preview">
              <div class="question-waiting__leaderboard-preview-items">
                <p class="question-waiting__leaderboard-preview-description">
                  Your details will show as:
                </p>

                <div class="question-waiting__leaderboard-preview-user-details">
                  <img
                    class="question-waiting__leaderboard-preview-avatar"
                    width="24" height="24"
                    src={`${user.avatarUrl}?sz=24`}
                    srcset={`${user.avatarUrl}?sz=48 2x, ${user.avatarUrl}?sz=72 3x`}
                  />
                  {user.name}
                </div>
              </div>
            </div>
          </div>)
        }
      </div>
    );
  }
}

QuestionWaiting.defaultProps = {
  onUserUpdate: function(){}
};