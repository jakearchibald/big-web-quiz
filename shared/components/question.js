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
import QuestionSpinner from './question-spinner';
import QuestionClosed from './question-closed'

export default class Question extends BoundComponent {
  constructor(props) {
    super(props);

    this.formAction = '/question-answer.json';
    this.form = null;

    this.state = {
      answersChecked: props.answersSubmitted || [],
      answersSubmitted: props.answersSubmitted || [],
      spinnerState: '',
      submittedAnswersThisSession: false
    };
  }
  componentWillReceiveProps(newProps) {
    if (this.props.id != newProps.id) {
      this.setState({
        answersChecked: [],
        submittedAnswersThisSession: false
      });
    }
  }
  componentDidMount() {
    // Scroll to top for new question
    document.documentElement.scrollTop = 0;
  }
  async onSubmit(event) {
    event.preventDefault();

    this.setState({
      spinnerState: 'spinning'
    });

    const answersChecked = this.state.answersChecked;

    try {
      const response = await fetch(this.formAction, {
        method: 'POST',
        credentials: 'include',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          id: this.props.id,
          // becomes an array of indexes checked
          choices: answersChecked.reduce((arr, choiceChecked, i) => {
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
      this.setState({
        spinnerState: '',
        submittedAnswersThisSession: false
      });

      throw err;
    }

    this.setState({
      answersSubmitted: answersChecked,
      spinnerState: '',
      submittedAnswersThisSession: true
    });
  }
  onChoiceChange() {
    this.setState({
      submittedAnswersThisSession: false,
      answersChecked: Array.from(
        this.form.querySelectorAll('input[name=answer]')
      ).map(el => el.checked)
    })
  }
  render({
    id, title, text, multiple, answers, closed,
    showLiveResults, correctAnswers, code,
    codeType, presentation
  }, {
    answersChecked, answersSubmitted, spinnerState,
    submittedAnswersThisSession
  }) {
    const codeEl = code && <Code code={code} codeType={codeType}></Code>;

    const answersToCheck = closed ? answersSubmitted : answersChecked;

    return (
      <section class={
        presentation ?
          'question question--presentation' :
          'question'
        }>
        {
          presentation ? '' :
          <div class={
            closed ?
              'question__selection-instructions question__selection-instructions--closed' :
              'question__selection-instructions'
          }>
            {
              multiple ? 'Select all that apply' : 'Select one'
            }
          </div>
        }
        <form
          class={(closed || showLiveResults) && (!correctAnswers) ? 'question__form question__form--closed' : 'question__form'}
          onSubmit={this.onSubmit}
          action={this.formAction}
          method="POST"
          ref={el => this.form = el}>
          <div class="question__container">
            <h1 class="question__title">{title}</h1>
            <p class="question__text">{text}</p>
            {codeEl}
            <div class={`question__answer-container ${(answers.length == 4 && code) ? 'presentation-answer-grid' : ''}`}>
              {answers.map((answer, i) =>
                <div class={
                  closed ?
                    'question__answer question__answer--closed' :
                    'question__answer'
                } key={`question-${id}-answer-${i}`}>
                  <input
                    id={`question-${id}-answer-${i}`}
                    type={multiple ? 'checkbox' : 'radio'}
                    name="answer"
                    value={i}
                    checked={answersToCheck[i]}
                    disabled={closed}
                    onChange={this.onChoiceChange}
                  />
                  <label
                    for={`question-${id}-answer-${i}`}
                    class={correctAnswers ?
                      (correctAnswers.includes(i) ?
                        'question__answer-label question__answer-label--correct' :
                        'question__answer-label question__answer-label--incorrect')
                    : 'question__answer-label'}>
                    <span class="question__answer-label-text">{answer.text}</span>
                  </label>
                </div>
              )}

              { (presentation || closed) ? '' :
                <div class="question__submit-container">
                  <div class="question__submit-container-inner">
                    <div class={
                      (submittedAnswersThisSession && !closed) ?
                        'question__submitted-answer question__submitted-answer--success' :
                        'question__submitted-answer'
                    }>Answer submitted</div>
                    <button disabled={closed || spinnerState || (answersChecked.length === 0 && !multiple)} class={
                      spinnerState ?
                        'question__submit question__submit--pending' :
                        'question__submit'
                    }>Submit</button>
                  </div>
                </div>
              }
            </div>
          </div>
        </form>
        { !presentation &&
          <QuestionClosed presentation={presentation} state={closed && (!correctAnswers)}/>
        }

      </section>
    );
  }
}
