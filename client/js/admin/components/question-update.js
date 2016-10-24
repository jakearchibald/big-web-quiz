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
import BoundComponent from '../../../../shared/components/bound-component';

const UPDATE_ACTION = '/admin/question-update.json';
const DELETE_ACTION = '/admin/question-delete.json';

function createAnswerObject() {
  return {text: '', correct: false};
}

export default class QuestionUpdate extends BoundComponent {
  constructor(props) {
    super(props);

    const {
      id = '',
      text = '',
      code = '',
      codeType = '',
      answers = [createAnswerObject(), createAnswerObject()],
      multiple = false,
      scored = true
    } = props;

    this.state = {text, code, codeType, answers, multiple, scored};
  }
  async onRemoveQuestion(event) {
    event.preventDefault();
    const sure = confirm('Delete question - are you sure?');
    if (!sure) return;

    try {
      const response = await fetch(DELETE_ACTION, {
        method: 'POST',
        credentials: 'include',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          id: this.props.id
        })
      });

      const data = await response.json();
      if (data.err) throw new Error(data.err);
      this.props.onQuestionRemoved(this.props.id, data.questions);
    }
    catch (err) {
      // TODO
      throw err;
    }
  }
  async onSubmit(event) {
    event.preventDefault();
    const {text, code, codeType, answers, multiple, scored} = this.state;
    const id = this.props.id;

    try {
      const response = await fetch(UPDATE_ACTION, {
        method: 'POST',
        credentials: 'include',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          text, code, codeType, answers,
          multiple, scored, id
        })
      });

      const data = await response.json();

      if (data.err) throw new Error(data.err);
      this.props.onQuestionSaved(id, data.questions);
    }
    catch (err) {
      // TODO
      throw err;
    }
  }
  onAddAnotherAnswer() {
    const answers = this.state.answers.slice();
    answers.push(createAnswerObject());
    this.setState({answers});
  }
  render({id}, {answers, multiple}) {
    return <form action={UPDATE_ACTION} method="POST" onSubmit={this.onSubmit}>
      {id ? <input type="hidden" name="id" value={id}/> : ''}
      <div><label>Question: <input type="text" value={this.state.text} onChange={this.linkState('text')}/></label></div>
      <div><label>Code: <textarea value={this.state.code} onChange={this.linkState('code')}/></label></div>
      <div>
        <label>
          Code type:
          <select value={this.state.codeType} onChange={this.linkState('codeType')}>
            <option value="">None</option>
            <option value="javascript">JavaScript</option>
            <option value="markup">Markup</option>
            <option value="css">CSS</option>
          </select>
        </label>
      </div>
      <div><label><input type="checkbox" checked={this.state.multiple} onChange={this.linkState('multiple')}/> Multiple answers</label></div>
      <div><label><input type="checkbox" checked={this.state.scored} onChange={this.linkState('scored')}/> Scored</label></div>
      <div>
        {answers.map((answer, i) =>
          <div key={'answer-' + i}>
            <label>
              Answer: <input type="text" value={answer.text} onChange={this.linkState(`answers.${i}.text`)} />
            </label>
            <label>
              <input
                type={multiple ? 'checkbox' : 'radio'}
                name="correct-answer" 
                checked={answer.correct}
                onChange={this.linkState(`answers.${i}.correct`)}
              />
              Correct answer
            </label>
          </div>
        )}
        <div><button type="button" onClick={this.onAddAnotherAnswer}>Add another answer</button></div>
      </div>
      <div>
        <button>{id ? 'Update question' : 'Save question'}</button>
        {id ? <button type="button" onClick={this.onRemoveQuestion}>Remove question</button> : null}
      </div>
    </form>
  }
}

QuestionUpdate.defaultProps = {
  onQuestionSaved: function(){},
  onQuestionRemoved: function(){}
};