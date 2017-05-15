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
import EndScreen from './end-screen';
import LongPoll from '../long-poll';

export default class App extends BoundComponent {
  constructor(props) {
    super(props);
    // State looks like:
    // {
    //   user: see simpleUserObject in server/user/views.js,
    //   lastMessageTime: Number, // the last message time sent to long-pollers
    //   question: {
    //     id: String,
    //     text: String,
    //     code: String, // optional code example
    //     multiple: Boolean, // accept multiple choices
    //     answers: [{text: String}]
    //   },
    //   questionClosed: Boolean,
    //   naiveLoginAllowed: Boolean,
    //   showEndScreen: Boolean,
    //   correctAnswers: [Number],
    //   answersSubmitted: [Number], answers the user submitted for the question
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
            // Is question changing?
            if (msg.question && (!this.state.question || this.state.question.id != msg.question.id)) {
              // Reset submitted questions
              msg.answersSubmitted = [];
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
  render({server}, {user, question, questionClosed, correctAnswers, answersSubmitted, naiveLoginAllowed, showEndScreen}) {
    // Question: OPEN
    const shouldShowQuestion = (question && !server) ||

      // Question: CLOSED
      (question && questionClosed) ||

      // Question: REVEALED
      (question && questionClosed && correctAnswers && correctAnswers.length);

    return (
      <div class="app">
        <header class="page-header">
          <div class="title">The Big Web Quiz</div>
          <LoginStatus
            server={server}
            user={user}
            onLogout={this.onLogout}
            onUserUpdate={this.onUserUpdate}
          />
        </header>
        <div class="container">
          {showEndScreen ?
            <EndScreen />
            :
            (user ?
              (shouldShowQuestion?
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
                  answersSubmitted={answersSubmitted}
                />
                :
                <QuestionWaiting
                  key="question-waiting"
                  user={user}
                  server={server}
                  onUserUpdate={this.onUserUpdate}
                />
              )
              :
              <Intro key="intro" naiveLoginAllowed={naiveLoginAllowed}/>
            )
          }
        </div>
        <a class="privacy" href="https://www.google.com/policies">Google Privacy Policy and Terms of Service</a>
        {server &&
          <div class="img-preloads">
            <img src="/static/images/ic_check_circle_black_24px.svg" alt=""/>
            <img src="/static/images/ic_check_circle_white_24px.svg" alt=""/>
            <img src="/static/images/ic_check_circle_outline_black_24px.svg" alt=""/>
            <img src="/static/images/ic_check_circle_outline_white_24px.svg" alt=""/>
            <img src="/static/images/ic_close_white_24px.svg" alt=""/>
            <img src="/static/images/spinner.png" alt=""/>
          </div>
        }
      </div>
    );
  }
}

App.defaultProps = {
  server: false
};

