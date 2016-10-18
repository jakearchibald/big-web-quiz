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

import {Login, Logout} from '../../../components/user';
import BoundComponent from '../../../components/bound-component';
import Intro from '../../../components/intro';
import QuestionWaiting from '../../../components/question-waiting';
import LoginStatus from '../../../components/login-status';
import Question from './Question';
import LongPoll from './long-poll';

async function getInitialState() {
  if (self.initialState) return self.initialState;

  // TODO get from IDB

  const response = await fetch('/me.json', {
    credentials: 'include'
  });
  const json = await response.json();

  return {
    checkedLogin: true,
    user: json.user
  };
}

class App extends BoundComponent {
  constructor(props) {
    super(props);
    // State looks like:
    // {
    //   checkedLogin: Boolean,
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

    if (this.state.user) {
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
  render(props, {user, question, questionClosed, correctAnswers}) {
    return (
      <div>
        <LoginStatus user={user} onLogout={this.onLogout} onUserUpdate={this.onUserUpdate}/>
        {user ?
          (question ?
            <Question
              id={question.id}
              text={question.text}
              multiple={question.multiple}
              answers={question.answers}
              closed={questionClosed}
              correctAnswers={correctAnswers}
            />
            : 
            <QuestionWaiting/>
          ) 
          :
          <Intro/>}
      </div>
    );
  }
}

getInitialState().then(state => {
  document.body.innerHTML = '';
  render(<App initialState={initialState}/>, document.body);
});