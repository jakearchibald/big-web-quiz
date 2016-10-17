import {h} from 'preact';

import BoundComponent from '../../../components/bound-component';

export default class Question extends BoundComponent {
  constructor(props) {
    super(props);

    this.formAction = '/question-answer.json';

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
          answers: this.state.answersChecked.reduce((arr, answerChecked, i) => {
            if (answerChecked) {
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
  render({text, multiple, answers}, {answersChecked}) {
    return (
      <form onSubmit={this.onSubmit} action={this.formAction} method="POST">
        <p>{text}</p>
        {answers.map((answer, i) =>
          <div>
            <label>
              <input
                key={`answer-${i}`}
                type={multiple ? 'checkbox' : 'radio'}
                name="answer"
                value={i}
                checked={answersChecked[i]}
                onChange={this.linkState(`answersChecked.${i}`)}
              />
              {answer.text}
            </label>
          </div>
        )}
        <button>Submit</button>
      </form>
    );
  }
}
