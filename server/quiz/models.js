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
import mongoose from '../mongoose-db';

const questionSchema = mongoose.Schema({
  // The question
  text: {type: String, required: true},
  // Answers can optionally have a code example
  code: String,
  // So syntax highlighting can do the right thing
  codeType: String,
  // User can select multiple answers (checkboxes rather than radios)
  multiple: Boolean,
  // Array of answers
  answers: [{
    text: {type: String, required: true},
    correct: Boolean
  }]
});

export const Question = mongoose.model('Question', questionSchema);

export class Quiz {
  constructor() {
    this._activeQuestion = null;
    this._acceptingAnswers = false;
    this._revealingAnswers = false;
    this._showingLeaderboard = false;
    this._cachedUserAnswers = {};
  }
  get activeQuestion() {
    return this._activeQuestion;
  }
  get acceptingAnswers() {
    return this._acceptingAnswers;
  }
  get revealingAnswers() {
    return this._revealingAnswers;
  }
  get showingLeaderboard() {
    return this._showingLeaderboard;
  }
  setQuestion(question) {
    this._activeQuestion = question;
    this._acceptingAnswers = true;
    this._revealingAnswers = false;
    this._cachedUserAnswers = {};
  }
  cacheAnswers(userId, answers) {
    this._cachedUserAnswers[userId] = answers;
  }
  getAverages() {
    let total = 0;
    const occurrences = Array(this._activeQuestion.answers.length).fill(0);

    for (const userId of Object.keys(this._cachedUserAnswers)) {
      total++;
      const choices = this._cachedUserAnswers[userId];
      for (const choice of choices) {
        occurrences[choice]++;
      }
    }

    return occurrences.map(n => n/total);
  }
  closeForAnswers() {
    if (!this._activeQuestion) throw Error("No active question");
    this._acceptingAnswers = false;
    this._revealingAnswers = false;
  }
  unsetQuestion() {
    this._activeQuestion = null;
    this._acceptingAnswers = false;
    this._revealingAnswers = false;
  }
  revealAnswers() {
    if (!this._activeQuestion) throw Error("No active question");
    this._acceptingAnswers = false;
    this._revealingAnswers = true;
  }
  showLeaderboard() {
    this._showingLeaderboard = true;
  }
  hideLeaderboard() {
    this._showingLeaderboard = false;
  }
  getState() {
    return {
      question: this._activeQuestion && {
        id: this._activeQuestion._id,
        text: this._activeQuestion.text,
        code: this._activeQuestion.code,
        codeType: this._activeQuestion.codeType,
        multiple: this._activeQuestion.multiple,
        // Don't want to send which answers are correct all the time,
        // see `correctAnswers` below
        answers: this._activeQuestion.answers.map(answer => ({text: answer.text}))
      },
      questionClosed: !this._acceptingAnswers,
      // array of indexes for the correct answers
      correctAnswers: this._revealingAnswers &&
        this._activeQuestion.answers.reduce((arr, answer, i) => {
          if (answer.correct) {
            arr.push(i);
          }
          return arr;
        }, [])
    }
  }
}
