import {h} from 'preact';
import BoundComponent from '../../../../components/bound-component';

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
      answers = [createAnswerObject(), createAnswerObject()],
      multiple = false
    } = props;

    this.state = {text, code, answers, multiple};
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
      this.props.onQuestionRemoved(this.props.id);
    }
    catch (err) {
      // TODO
      throw err;
    }
  }
  async onSubmit(event) {
    event.preventDefault();
    const {text, code, answers, multiple} = this.state;
    const id = this.props.id;

    try {
      const response = await fetch(UPDATE_ACTION, {
        method: 'POST',
        credentials: 'include',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          text, code, answers, multiple,
          id
        })
      });

      const data = await response.json();

      if (data.err) throw new Error(data.err);
      this.props.onQuestionSaved(data.question);
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
      <div><label>Code: <textarea  value={this.state.code} onChange={this.linkState('code')}/></label></div>
      <div><label><input type="checkbox" checked={this.state.multiple} onChange={this.linkState('multiple')}/> Multiple answers</label></div>
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