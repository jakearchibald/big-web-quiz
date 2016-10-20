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
import QuestionUpdate from './components/question-update.js';

class App extends BoundComponent {
  constructor(props) {
    super(props);

    this.state = {
      questions: props.questions,
      addingQuestion: false,
      editingQuestions: [] // ids
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
      if (question.closed) {
        if (question.revealingAnswers) {
          return <button onClick={event => this.setQuestionState(question, 'deactivate')}>Deactivate</button>;
        }
        return <button onClick={event => this.setQuestionState(question, 'reveal')}>Reveal Answers</button>;
      }
      return <button onClick={event => this.setQuestionState(question, 'close')}>Close</button>;
    }
    return <button onClick={event => this.setQuestionState(question, 'activate')}>Activate</button>;
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
  async onLogDatabaseClick() {
    try {
      const response = await fetch('/admin/db.json', {
        credentials: 'include'
      });
      console.log(await response.json());
    }
    catch (err) {
      throw err;
    }
  }
  render(props, {questions, addingQuestion, editingQuestions, showingLeaderboard}) {
    return <div>
      <ol>
        {questions.map((question, i) => {
          if (editingQuestions.includes(question._id)) {
            return (
              <li key={question._id}>
                <QuestionUpdate
                  id={question._id}
                  text={question.text}
                  code={question.code}
                  codeType={question.codeType}
                  multiple={question.multiple}
                  answers={question.answers}
                  onQuestionSaved={this.onQuestionSaved}
                  onQuestionRemoved={this.onQuestionRemoved}
                />
              </li>
            );
          }
          return (
            <li key={question._id}>
              <p>
                <button onClick={event => this.onEditQuestionClick(event, question)}>Edit</button>
                {this.questionActionButton(question)}
              </p>
              <p>Text: {question.text}</p>
              <p>Code: {question.code}</p>
              <p>Code type: {question.codeType}</p>
              <p>Multiple: {String(question.multiple)}</p>
              <p>Answers:</p>
              <ol>
                {question.answers.map((answer, i) => 
                  <li key={`${question.id}-answer-${i}`}>
                    {answer.text}
                    {answer.correct ? ' - correct' : ''}
                  </li>
                )}
              </ol>
            </li>
          );
        })}
      </ol>
      {addingQuestion ?
        <QuestionUpdate onQuestionSaved={this.onQuestionSaved}/>
        :
        <div><button onClick={this.onAddQuestionClick}>+</button></div>
      }
      <div><button onClick={this.onDropUserAnswersClick}>Drop user answers</button></div>
      <div><button onClick={this.onDropUsersClick}>Drop users</button></div>
      <div><button onClick={this.onLogDatabaseClick}>Log database</button></div>
      <div>
        {showingLeaderboard ?
          <button onClick={this.onHideLeaderboardClick}>Hide leaderboard in presentation view</button>
          :
          <button onClick={this.onShowLeaderboardClick}>Show leaderboard in presentation view</button>
        }
      </div>
    </div>;
  }
}

fetch('/admin/initial-state.json', {
  credentials: 'include'
}).then(response => response.json()).then(data => {
  render(<App questions={data.questions} />, document.body);
});