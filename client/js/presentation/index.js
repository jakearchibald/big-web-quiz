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

import Waiting from './components/waiting';
import Question from '../../../shared/components/question';
import AverageValue from './components/average-value';
import BoundComponent from '../../../shared/components/bound-component';

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
      ]
    };

    const eventSource = new EventSource('/presentation/listen');
    eventSource.onmessage = event => {
      const data = JSON.parse(event.data);

      if (data.question && !this.state.question) { // new question!
        // Random order to display answers
        data.answerDisplayOrder = shuffle(data.question.answers.map((_, i) => i));
        data.averages = data.averages || Array(data.question.answers.length).fill(0);
      }

      this.setState(data);
    };
  }
  render(props, {question, questionClosed, correctAnswers, answerDisplayOrder, averages, leaderboard, showLiveResults}) {
    if (leaderboard) return (
      <table>
        <thead>
          <tr><th>Player</th><th>Score</th></tr>
        </thead>
        {leaderboard.map(user =>
          <tr>
            <td>
              <img src={user.avatarUrl}/>
              {user.name}
            </td>
            <td>{user.score}</td>
          </tr>
        )}
      </table>
    );

    if (!question) return (
      <Waiting />
    );

    return (
      <div>
        <Question
          key="question"
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
            {answerDisplayOrder.map(i =>
              <AverageValue
                color={this.state.colors[i % this.state.colors.length]}
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

render(<App />, document.body);
