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

import BoundComponent from '../../../shared/components/bound-component';
import QuestionUpdate from './components/question-update';
import Leaderboard from './components/leaderboard';

class App extends BoundComponent {
  constructor(props) {
    super(props);

    this.state = {
      questions: props.questions,
      showingLeaderboard: props.showingLeaderboard,
      showingVideo: props.showingVideo,
      showingBlackout: props.showingBlackout,
      naiveLoginAllowed: props.naiveLoginAllowed,
      showingEndScreen: props.showingEndScreen,
      addingQuestion: false,
      editingQuestions: [], // ids
      outputValue: '',
      view: 'questions'
    };
  }
  onQuestionSaved(id, questions) {
    if (id) { // updating
      this.setState({
        questions,
        editingQuestions: this.state.editingQuestions.filter(editingId => editingId != id)
      });
    }
    else { // adding
      this.setState({
        questions,
        addingQuestion: false
      });
    }
  }
  onQuestionRemoved(id, questions) {
    this.setState({
      questions,
      editingQuestions: this.state.editingQuestions.filter(editingId => editingId != id)
    });
  }
  onAddQuestionClick() {
    this.setState({
      addingQuestion: true
    });
  }
  onEditQuestionClick(event, question) {
    const editingQuestions = this.state.editingQuestions.slice();
    editingQuestions.push(question._id);
    this.setState({editingQuestions});
  }
  async setQuestionState(question, state) {
    try {
      const response = await fetch(`/admin/question-${state}.json`, {
        method: 'POST',
        credentials: 'include',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({id: question._id})
      });

      const data = await response.json();

      if (data.err) throw Error(data.err);

      this.setState(data);
    }
    catch (err) {
      // TODO
      throw err;
    }
  }
  questionActionButton(question) {
    if (question.active) {
      if (question.showingLiveResults) {
        if (question.closed) {
          const questionHasACorrectAnswer = question.answers.some(a => a.correct);
          if (question.revealingAnswers || !questionHasACorrectAnswer) {
            return <button class="admin__question-state admin__question-state--deactivate" onClick={event => this.setQuestionState(question, 'deactivate')}>Deactivate</button>;
          }
          return <button class="admin__question-state admin__question-state--reveal" onClick={event => this.setQuestionState(question, 'reveal')}>Reveal Answers</button>;
        }
        return <button class="admin__question-state admin__question-state--close" onClick={event => this.setQuestionState(question, 'close')}>Close</button>;
      }
      return <button class="admin__question-state admin__question-state--live" onClick={event => this.setQuestionState(question, 'show-live-results')}>Show live results</button>;
    }
    return <button class="admin__question-state admin__question-state--activate" onClick={event => this.setQuestionState(question, 'activate')}>Activate Question</button>;
  }
  onDropUserAnswersClick() {
    const sure = confirm("Delete all user answers - are you sure?");
    if (!sure) return;

    fetch('/admin/delete-user-answers.json', {
      credentials: 'include',
      method: 'POST'
    });
  }
  onDropUsersClick() {
    const sure = confirm("Delete all users - are you sure?");
    if (!sure) return;

    fetch('/admin/delete-users.json', {
      credentials: 'include',
      method: 'POST'
    });
  }
  async onShowLeaderboardClick() {
    try {
      const response = await fetch(`/admin/show-leaderboard.json`, {
        method: 'POST',
        credentials: 'include'
      });

      const data = await response.json();

      if (data.err) throw Error(data.err);

      this.setState(data);
    }
    catch (err) {
      // TODO
      throw err;
    }
  }
  async onHideLeaderboardClick() {
    try {
      const response = await fetch(`/admin/hide-leaderboard.json`, {
        method: 'POST',
        credentials: 'include'
      });

      const data = await response.json();

      if (data.err) throw Error(data.err);

      this.setState(data);
    }
    catch (err) {
      // TODO
      throw err;
    }
  }
  async onShowBlackoutClick() {
    try {
      const response = await fetch(`/admin/show-blackout.json`, {
        method: 'POST',
        credentials: 'include'
      });

      const data = await response.json();

      if (data.err) throw Error(data.err);

      this.setState(data);
    }
    catch (err) {
      // TODO
      throw err;
    }
  }
  async onHideBlackoutClick() {
    try {
      const response = await fetch(`/admin/hide-blackout.json`, {
        method: 'POST',
        credentials: 'include'
      });

      const data = await response.json();

      if (data.err) throw Error(data.err);

      this.setState(data);
    }
    catch (err) {
      // TODO
      throw err;
    }
  }
  async onAllowNaiveLoginClick() {
    const response = await fetch(`/admin/allow-naive-login.json`, {
      method: 'POST',
      credentials: 'include'
    });

    const data = await response.json();

    if (data.err) throw Error(data.err);

    this.setState(data);
  }
  async onDisallowNaiveLoginClick() {
    const response = await fetch(`/admin/disallow-naive-login.json`, {
      method: 'POST',
      credentials: 'include'
    });

    const data = await response.json();

    if (data.err) throw Error(data.err);

    this.setState(data);
  }
  async onOutputClick(types) {
    try {
      const response = await fetch('/admin/db.json?' + types.map(t => `types[]=${t}`).join('&'), {
        credentials: 'include'
      });
      const data = await response.json();
      console.log(data);
      this.setState({outputValue: JSON.stringify(data, null, 2)});
    }
    catch (err) {
      throw err;
    }
  }
  async onRestoreClick() {
    try {
      const response = await fetch('/admin/db.json', {
        credentials: 'include',
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: this.state.outputValue
      });
      const data = await response.json();
      const initialStateResponse = await fetch('/admin/initial-state.json', {
        credentials: 'include'
      });
      this.setState(await initialStateResponse.json());
    }
    catch (err) {
      throw err;
    }
  }

  onQuestionsShowClicked() {
    this.setState({view: 'questions'});
  }

  onLeaderboardShowClicked() {
    this.setState({view: 'leaderboard'});
  }

  onDataShowClicked() {
    this.setState({view: 'data'});
  }

  async showVideo(type) {
    try {
      const response = await fetch(`/admin/show-video.json`, {
        method: 'POST',
        credentials: 'include',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({video: type})
      });

      const data = await response.json();

      if (data.err) throw Error(data.err);

      this.setState(data);
    }
    catch (err) {
      // TODO
      throw err;
    }
  }

  async setEndScreen(show) {
    const response = await fetch(`/admin/set-end-screen.json`, {
      method: 'POST',
      credentials: 'include',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({show})
    });

    const data = await response.json();

    if (data.err) throw Error(data.err);

    this.setState(data);
  }

  onShowEndScreenClick() {
    return this.setEndScreen(true);
  }

  onHideEndScreenClick() {
    return this.setEndScreen(false);
  }

  render(props, {
    questions, addingQuestion, editingQuestions, showingLeaderboard,
    outputValue, view, showingVideo, showingBlackout, naiveLoginAllowed,
    showingEndScreen
  }) {
    return <div>

      <div class="admin__nav">
        <button
          class={
            view === 'questions' ? 'admin__nav--active' : ''
          }
          onClick={this.onQuestionsShowClicked}>Questions</button>
        <button
          class={
            view === 'leaderboard' ? 'admin__nav--active' : ''
          }
          onClick={this.onLeaderboardShowClicked}>Leaderboard</button>
        <button
          class={
            view === 'data' ? 'admin__nav--active' : ''
          }
          onClick={this.onDataShowClicked}>Data</button>
      </div>

      {
        view === 'questions' ?

        <section class="admin__questions">

          {
            addingQuestion ?
            <QuestionUpdate onQuestionSaved={this.onQuestionSaved}/>
            :
            <div class="admin__questions-add">
              {showingEndScreen ?
                <button onClick={this.onHideEndScreenClick}>Hide End Screen</button>
                :
                <button onClick={this.onShowEndScreenClick}>Show End Screen</button>
              }

              {naiveLoginAllowed ?
                <button onClick={this.onDisallowNaiveLoginClick}>Disable naive login</button>
                :
                <button onClick={this.onAllowNaiveLoginClick}>Allow naive login</button>
              }
              {showingBlackout ?
                <button onClick={this.onHideBlackoutClick}>Hide blackout</button>
                :
                <button onClick={this.onShowBlackoutClick}>Show blackout</button>
              }
              {showingVideo == 'intro' ?
                <button onClick={() => this.showVideo('')}>Hide intro</button>
                :
                <button onClick={() => this.showVideo('intro')}>Show intro</button>
              }
              {showingVideo == 'prize' ?
                <button onClick={() => this.showVideo('')}>Hide prize</button>
                :
                <button onClick={() => this.showVideo('prize')}>Show prize</button>
              }
              <button onClick={this.onAddQuestionClick}>Add question</button>
            </div>
          }

          <ol class="admin__questions-list">
            {questions.map((question, i) => {
              if (editingQuestions.includes(question._id)) {
                return (
                  <li key={question._id}>
                    <QuestionUpdate
                      id={question._id}
                      title={question.title}
                      text={question.text}
                      code={question.code}
                      codeType={question.codeType}
                      multiple={question.multiple}
                      scored={question.scored}
                      priority={question.priority}
                      answers={question.answers}
                      onQuestionSaved={this.onQuestionSaved}
                      onQuestionRemoved={this.onQuestionRemoved}
                    />
                  </li>
                );
              }
              return (
                <li class={
                  question.active ?
                  'admin__question admin__question--active':
                  'admin__question'
                } key={question._id}>
                  <h1 class="admin__question-title">Title: {question.title}</h1>
                  <table class="admin__question-table">
                    <tr>
                      <td>Text:</td>
                      <td>{question.text}</td>
                    </tr>
                    {question.code &&
                      <tr>
                        <td>Code:</td>
                        <td>
                          {question.codeType}:
                          <pre>{question.code}</pre>
                        </td>
                      </tr>
                    }
                    <tr>
                      <td>Multiple:</td>
                      <td>{String(question.multiple)}</td>
                    </tr>
                    <tr>
                      <td>Scored:</td>
                      <td>{String(question.scored)}</td>
                    </tr>
                    <tr>
                      <td>Priority:</td>
                      <td>{String(question.priority)}</td>
                    </tr>
                    <tr>
                      <td>Answers:</td>
                      <td>
                        <ol class="admin__answer-list">
                          {question.answers.map((answer, i) =>
                            <li class={
                                answer.correct ?
                                'admin__answer admin__answer--correct' :
                                'admin__answer'
                              }
                              key={`${question.id}-answer-${i}`}>
                              {answer.text}
                            </li>
                          )}
                        </ol>
                      </td>
                    </tr>
                  </table>

                  <p class="admin__buttons">
                    <button class="admin__question-edit" onClick={event => this.onEditQuestionClick(event, question)}>Edit</button>
                    {this.questionActionButton(question)}
                  </p>
                </li>
              );
            })}
          </ol>

        </section>

        :

        (view === 'leaderboard' ?

          <section>
            <div class="admin__questions-add">
              {showingLeaderboard ?
                <button class="admin__leaderboard-toggle" onClick={this.onHideLeaderboardClick}>Hide leaderboard in presentation view</button>
                :
                <button class="admin__leaderboard-toggle" onClick={this.onShowLeaderboardClick}>Show leaderboard in presentation view</button>
              }
            </div>
            <Leaderboard/>
          </section>

          :

          <section class="admin__data">
            <div class="admin__data-user-controls">
              <button class="admin__data-user-answers" onClick={this.onDropUserAnswersClick}>Drop user answers</button>
              <button class="admin__data-users" onClick={this.onDropUsersClick}>Drop users</button>
            </div>

            <div class="admin__data-dump-controls">
              <button onClick={() => this.onOutputClick(['Question'])}>Output questions</button>
              <button onClick={() => this.onOutputClick(['User'])}>Output users</button>
              <button onClick={() => this.onOutputClick(['Question', 'User'])}>Output both</button>
            </div>
            <div class="admin__data-dump">
              <textarea value={outputValue} onChange={this.linkState('outputValue')}></textarea>
            </div>
            <div class="admin__data-restore">
              <button onClick={this.onRestoreClick}>Restore models from above</button>
              <p>Only touches models that are mentioned in the above JSON. All existing data in that model is replaced.</p>
            </div>
          </section>
        )
      }
    </div>;
  }
}

fetch('/admin/initial-state.json', {
  credentials: 'include'
}).then(response => response.json()).then(data => {
  const main = document.querySelector('.main-content');
  render(<App
    questions={data.questions}
    showingLeaderboard={data.showingLeaderboard}
    showingVideo={data.showingVideo}
    showingBlackout={data.showingBlackout}
    naiveLoginAllowed={data.naiveLoginAllowed}
    showingEndScreen={data.showingEndScreen} />, main);
});