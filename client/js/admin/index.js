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

import BoundComponent from '../../../components/bound-component';
import QuestionUpdate from './components/question-update.js';

class App extends BoundComponent {
  constructor(props) {
    super(props);

    this.state = {
      questions: props.questions,
      addingQuestion: false
    }
  }
  onQuestionSaved(question) {
    const questions = this.state.questions.slice();
    const index = questions.findIndex(q => q._id == question._id);
    const update = {questions};

    if (index != -1) { // updating
      questions[index] = question;
    }
    else {
      questions.push(question);
      update.addingQuestion = false;
    }

    this.setState(update);
  }
  onQuestionRemoved(id) {
    const questions = this.state.questions.filter(q => q._id != id);
    this.setState({questions});
  }
  onAddQuestionClick() {
    this.setState({
      addingQuestion: true
    });
  }
  onEditQuestionClick(event, question) {
    question.editing = true;

    this.setState({
      questions: this.state.questions
    });
  }
  async onActivateQuestionClick(event, question) {
    try {
      await fetch('/admin/question-activate.json', {
        method: 'POST',
        credentials: 'include',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({id: question._id})
      });
    }
    catch (err) {
      // TODO
      throw err;
    }
  }
  render(props, {questions, addingQuestion}) {
    return <div>
      <ol>
        {questions.map((question, i) => {
          if (question.editing) {
            return <li key={question._id}>
              <QuestionUpdate
                id={question._id}
                text={question.text}
                code={question.code}
                multiple={question.multiple}
                answers={question.answers}
                onQuestionSaved={this.onQuestionSaved}
                onQuestionRemoved={this.onQuestionRemoved}
              />
            </li>
          }
          return <li key={question._id}>
            <p>
              <button onClick={event => this.onEditQuestionClick(event, question)}>Edit</button>
              <button onClick={event => this.onActivateQuestionClick(event, question)}>Activate</button>
            </p>
            <p>Text: {question.text}</p>
            <p>Code: {question.code}</p>
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
        })}
      </ol>
      {addingQuestion ?
        <QuestionUpdate onQuestionSaved={this.onQuestionSaved}/>
        :
        <div><button onClick={this.onAddQuestionClick}>+</button></div>
      }
    </div>;
  }
}


fetch('/admin/questions.json', {
  credentials: 'include'
}).then(response => response.json()).then(questions => {
  render(<App questions={questions} />, document.body);
});