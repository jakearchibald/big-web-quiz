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
import {h} from 'preact';

import BoundComponent from './bound-component';
import Code from './code';

export default class Question extends BoundComponent {
  constructor(props) {
    super(props);

    this.formAction = '/question-answer.json';
    this.form = null;

    this.state = {
      answersChecked: []
    };
  }
  async onSubmit(event) {
    event.preventDefault();
    // TODO feedback and progress

    try {
      const response = await fetch(this.formAction, {
        method: 'POST',
        credentials: 'include',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          id: this.props.id,
          // becomes an array of indexes checked
          choices: this.state.answersChecked.reduce((arr, choiceChecked, i) => {
            if (choiceChecked) {
              arr.push(i);
            }
            return arr;
          }, [])
        })
      });

      const data = await response.json();

      if (data.err) throw Error(data.err);
    }
    catch (err) {
      // TODO
      throw err;
    }
  }
  onChoiceChange() {
    this.setState({
      answersChecked: Array.from(
        this.form.querySelectorAll('input[name=answer]')
      ).map(el => el.checked)
    })
  }
  render({text, multiple, answers, closed, correctAnswers, code, codeType}, {answersChecked}) {
    const codeEl = code && <Code code={code} codeType={codeType}></Code>;

    return (
      <form
        onSubmit={this.onSubmit}
        action={this.formAction}
        method="POST"
        ref={el => this.form = el}>
        <p>{text}</p>
        {codeEl}
        {answers.map((answer, i) =>
          <div>
            <label>
              <input
                key={`answer-${i}`}
                type={multiple ? 'checkbox' : 'radio'}
                name="answer"
                value={i}
                checked={answersChecked[i]}
                disabled={closed}
                onChange={this.onChoiceChange}
              />
              {answer.text}
              {correctAnswers ?
                (correctAnswers.includes(i) ? ' - This was a correct answer' : '') 
              : ''}
            </label>
          </div>
        )}
        <button>Submit</button>
      </form>
    );
  }
}
