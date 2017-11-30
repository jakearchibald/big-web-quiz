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
import Question from '../../../shared/components/question';
import AverageValue from './components/average-value';
import BoundComponent from '../../../shared/components/bound-component';

const colors = [
  '#47DDBE',
  '#89DCEB',
  '#EEBB68',
  '#E576D4',
  '#F4ECB8'
];

class App extends BoundComponent {
  constructor(props) {
    super(props);
    this.introVideo = null;
    this.prizeVideo = null;
    this.state = {
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
  update(prevProps={}, prevState={}) {
    if (this.state.showVideo == 'intro' && prevState.showVideo != 'intro') {
      if (this.introVideo) this.introVideo.play();
    }
    else if (!this.state.showVideo == 'intro' && prevState.showVideo == 'intro') {
      setTimeout(() => {
        if (this.introVideo) {
          this.introVideo.pause();
          this.introVideo.currentTime = 0;
        }
      }, 1000);
    }

    if (this.state.showVideo == 'prize' && prevState.showVideo != 'prize') {
      if (this.prizeVideo) this.prizeVideo.play();
    }
    else if (!this.state.showVideo == 'prize' && prevState.showVideo == 'prize') {
      setTimeout(() => {
        if (this.prizeVideo) {
          this.prizeVideo.pause();
          this.prizeVideo.currentTime = 0;
        }
      }, 1000);
    }
  }
  componentDidMount() {
    this.update();

    document.addEventListener('keyup', event => {
      if (event.key == 'f') {
        event.preventDefault();
        document.documentElement.webkitRequestFullscreen();
      }
    });
  }
  componentDidUpdate(prevProps, prevState) {
    this.update(prevProps, prevState);
  }
  render(props, {question, questionClosed, correctAnswers, answerDisplayOrder, averages, leaderboard, showLiveResults, showVideo, showBlackout}) {
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
        </div>
      );
    }

    if (!question) {
      return (
        <div>
          <img src="/static/images/title.png" class="opening-media opening-media--show"/>
          <div class={`blackout ${showBlackout ? 'blackout--show' : ''}`}/>
          <div class={`opening-media ${showVideo == 'intro' ? 'opening-media--show' : ''}`}>
          </div>
          <div class={`opening-media ${showVideo == 'prize' ? 'opening-media--show' : ''}`}>
          </div>
        </div>
      );
    }

    return (
      <Audio key="the-amaze-audio" closed={questionClosed} stepItUp={showLiveResults}>
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
                color={colors[j % colors.length]}
                questionClosed={questionClosed}
                text={question.answers[i].text}
                key={`avg-${question.id}-answer-${i}`}
                targetValue={averages[i]} />
            )}
          </div>
          : ''
        }
      </Audio>
    );
  }
}

const main = document.querySelector('.main-content');
render(<App />, main);
