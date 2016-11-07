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
import {h, render} from 'preact';
import regeneratorRuntime from 'regenerator-runtime/runtime';
// so we don't have to keep importing it
self.regeneratorRuntime = regeneratorRuntime;

import shuffle from 'shuffle-array';

import Audio from './components/audio';
import Waiting from './components/waiting';
import Question from '../../../shared/components/question';
import AverageValue from './components/average-value';
import BoundComponent from '../../../shared/components/bound-component';
import Transition from '../../../shared/components/transition';

class App extends BoundComponent {
  constructor(props) {
    super(props);
    this.state = {
      colors: [
        '#47DDBE',
        '#89DCEB',
        '#EEBB68',
        '#E576D4',
        '#F4ECB8'
      ],
      showIntro: false
    };

    const eventSource = new EventSource('/presentation/listen');
    eventSource.onmessage = event => {
      const data = JSON.parse(event.data);

      // Is this a new question?
      if (data.question && (!this.state.question || data.question.id != this.state.question.id)) {
        // Random order to display answers
        data.answerDisplayOrder = shuffle(data.question.answers.map((_, i) => i));
        data.averages = data.averages || Array(data.question.answers.length).fill(0);
      }

      this.setState(data);
    };
  }
  async onTransition(exiting, exitingEl, current, currentEl) {
    const videoContainer = [exitingEl, currentEl].find(el => el.classList && el.classList.contains('opening-video'));
    const video = videoContainer.querySelector('video');
    const entering = videoContainer == currentEl;

    if (entering) {
      // preact seems to reuse the video element if you toggle showing/hiding,
      // this isn't what I expected to do, but I guess I'll roll with it
      video.currentTime = 0;
    }

    await new Promise(resolve => {
      videoContainer.offsetWidth;
      videoContainer.classList.toggle('opening-video--show');
      videoContainer.offsetWidth;


      const anim = videoContainer.getAnimations()[0];
      anim.onfinish = resolve;
      anim.oncancel = resolve;
    });

    // ugh, seems like preact is moving the DOM around after the transition
    // which causes video playback to stop. Queuing a task gets us past the
    // transition.
    setTimeout(() => {
      if (entering) {
        video.play();
      }
    }, 0);
  }
  render(props, {question, questionClosed, correctAnswers, answerDisplayOrder, averages, leaderboard, showLiveResults, showIntro}) {
    if (leaderboard) {
      let type = 0;
      let position = 1;
      let lastScore = (leaderboard.length > 0) ? leaderboard[0].score : -1;
      for (let i = 0; i < leaderboard.length; i++) {
        if (!leaderboard[i]) {
          continue;
        }

        if (i > 0 && leaderboard[i].score !== lastScore) {
          type++;
          position++;
        }

        leaderboard[i].type = type;
        leaderboard[i].position = position;
        lastScore = leaderboard[i].score;
      }

      return (
        <div class="leaderboard">
          <div class="leaderboard__winners">
            {leaderboard.map((player, index) =>
              index > 2 ? '' :
              <div class={`leaderboard__winner leaderboard__winner-${player.type}`}>
                <div class="leaderboard__winner-block"></div>
                <img
                  class="leaderboard__winner-avatar"
                  width="110"
                  height="110"
                  src={`${player.avatarUrl}?sz=110`}
                  srcset={`${player.avatarUrl}?sz=220 2x, ${player.avatarUrl}?sz=330 3x`}
                />

                <div class="leaderboard__winner-position">{player.position}</div>
                <div class="leaderboard__winner-name">{player.name}</div>
                <div class="leaderboard__winner-score">{player.score}</div>
              </div>
            )}
          </div>

          <table class="leaderboard__scores" cellSpacing="0">
            <tbody>
              {leaderboard.map((player, index) =>
                index < 3 ? '' :
                <tr>
                  <td>
                    {player.position}.
                  </td>

                  <td>
                    {player.name}
                  </td>

                  <td>
                    {player.score}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      );
    }

    if (!question) return (
      <Transition onTransition={this.onTransition}>
        {showIntro ?
          <div class="opening-video" key="opening-video">
            <video
              class="opening-video__src"
              src="/static/video/intro.mp4"
            />
          </div>
          :
          <Waiting key="question-waiting"/>
        } 
      </Transition>
    );

    return (
      <div>
        <Audio key="the-amaze-audio" closed={questionClosed} stepItUp={showLiveResults} />
        <Question
          key={`question-${question.id}`}
          id={question.id}
          title={question.title}
          text={question.text}
          multiple={question.multiple}
          answers={question.answers}
          code={question.code}
          codeType={question.codeType}
          closed={questionClosed}
          correctAnswers={correctAnswers}
          showLiveResults={showLiveResults}
          presentation={true}
        />

        {showLiveResults && answerDisplayOrder && !correctAnswers ?
          <div class="live-results">
            {answerDisplayOrder.map((i, j) =>
              <AverageValue
                color={this.state.colors[j % this.state.colors.length]}
                questionClosed={questionClosed}
                text={question.answers[i].text}
                key={`avg-${question.id}-answer-${i}`}
                targetValue={averages[i]} />
            )}
          </div>
          : ''
        }
      </div>
    );
  }
}

const main = document.querySelector('.main-content');
render(<App />, main);
