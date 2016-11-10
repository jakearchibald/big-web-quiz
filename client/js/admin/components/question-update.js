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
      title = '',
      text = '',
      code = '',
      codeType = '',
      answers = [createAnswerObject(), createAnswerObject()],
      multiple = false,
      scored = true,
      priority = false
    } = props;

    this.state = {title, text, code, codeType, answers, multiple, scored, priority};
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
    const {title, text, code, codeType, answers, multiple, scored, priority} = this.state;
    const id = this.props.id;

    try {
      const response = await fetch(UPDATE_ACTION, {
        method: 'POST',
        credentials: 'include',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          title, text, code, codeType,
          answers, multiple, scored, id, priority
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
  onAnswerChange(event, i) {
    const answers = this.state.answers;

    if (!this.state.multiple) {
      answers.forEach(answer => answer.correct = false);
    }
    answers[i].correct = event.target.checked;
  }
  render({id}, {answers, multiple}) {
    return <form class="admin__question-edit-form" action={UPDATE_ACTION} method="POST" onSubmit={this.onSubmit}>
      {id ? <input type="hidden" name="id" value={id}/> : ''}
      <table class="admin__question-table">
        <tr>
          <th>Title:</th><td><input type="text" value={this.state.title} onChange={this.linkState('title')}/></td>
        </tr>

        <tr>
          <th>Question:</th><td><input type="text" value={this.state.text} onChange={this.linkState('text')}/></td>
        </tr>

        <tr>
          <th>Code:</th><td><textarea value={this.state.code} onChange={this.linkState('code')}/></td>
        </tr>

        <tr>
          <th>Code type:</th>
          <td>
            <select value={this.state.codeType} onChange={this.linkState('codeType')}>
              <option value="">None</option>
              <option value="javascript">JavaScript</option>
              <option value="markup">Markup</option>
              <option value="css">CSS</option>
            </select>
          </td>
        </tr>

        <tr>
          <th>Multiple answers:</th><td><input type="checkbox" checked={this.state.multiple} onChange={this.linkState('multiple')}/></td>
        </tr>

        <tr>
          <th>Scored:</th><td><input type="checkbox" checked={this.state.scored} onChange={this.linkState('scored')}/></td>
        </tr>

        <tr>
          <th>Priority:</th><td><input type="checkbox" checked={this.state.priority} onChange={this.linkState('priority')}/></td>
        </tr>

        {answers.map((answer, i) =>
          <tr key={'answer-' + i}>
            <th>
              Answer:
            </th>
            <td>
              <div>
                <input type="text" value={answer.text} onChange={this.linkState(`answers.${i}.text`)} />
              </div>

              <label class="admin__question-correct-answer">
                <input
                  type={multiple ? 'checkbox' : 'radio'}
                  name="correct-answer"
                  checked={answer.correct}
                  onChange={event => this.onAnswerChange(event, i)}
                />
                Correct answer
              </label>
            </td>
          </tr>
        )}

      </table>
      <div class="admin__buttons">
        <button class="admin__buttons-add-answer" type="button" onClick={this.onAddAnotherAnswer}>Add another answer</button>
      </div>
      <div class="admin__update-question">
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