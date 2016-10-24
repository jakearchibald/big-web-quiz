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

import {Login, Logout} from './user';
import BoundComponent from './bound-component';
import Intro from './intro';
import QuestionWaiting from './question-waiting';
import LoginStatus from './login-status';
import Question from './question';
import Transition from './transition';
import LongPoll from '../long-poll';

export default class App extends BoundComponent {
  constructor(props) {
    super(props);
    // State looks like:
    // {
    //   user: {name: String, avatarUrl: String, appearOnLeaderboard: Boolean},
    //   lastMessageTime: Number, // the last message time sent to long-pollers
    //   question: {
    //     id: String,
    //     text: String,
    //     code: String, // optional code example
    //     multiple: Boolean, // accept multiple choices
    //     answers: [{text: String}]
    //   },
    //   questionClosed: Boolean,
    //   correctAnswers: [Number]
    // }
    this.state = props.initialState;

    if (this.state.user && !props.server) {
      // trying to stop the spinner on Safari
      window.load.then(() => {
        requestAnimationFrame(() => {
          const longPoll = new LongPoll(props.initialState.lastMessageTime);

          longPoll.on('message', msg => {
            if (msg.correctAnswers) { // update the score
              // TODO: change view while this is updating?
              fetch('/me.json', {
                credentials: 'include'
              }).then(r => r.json()).then(data => {
                this.setState({user: data.user});
              });
            }
            this.setState(msg);
          });
        })
      });
    }
  }
  onUserUpdate(user) {
    this.setState({user});
  }
  onLogout() {
    this.setState({
      user: null
    });
  }
  render({server}, {user, question, questionClosed, correctAnswers}) {
    return (
      <div>
        <header class="page-header">
          <div class="title">The Big Web Quiz</div>
          <LoginStatus user={user} onLogout={this.onLogout} onUserUpdate={this.onUserUpdate}/>
        </header>
        <Transition>
          {user ?
            (question && !server ?
              <Question
                key="question"
                id={question.id}
                text={question.text}
                multiple={question.multiple}
                answers={question.answers}
                code={question.code}
                codeType={question.codeType}
                closed={questionClosed}
                correctAnswers={correctAnswers}
              />
              : 
              <QuestionWaiting key="question-waiting" />
            ) 
            :
            <Intro key="intro"/>
          }
        </Transition>
      </div>
    );
  }
}

App.defaultProps = {
  server: false
};

