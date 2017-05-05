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
  // Human readable ID
  key: {type: String, index: true, unique: true, required: true},
  // Short title of the question, eg "Question 1"
  title: {type: String, required: true, default: "Question!"},
  // The actual question
  text: {type: String, required: true},
  // Answers can optionally have a code example
  code: String,
  // So syntax highlighting can do the right thing
  codeType: String,
  // User can select multiple answers (checkboxes rather than radios)
  multiple: Boolean,
  // Scored? Questions can be non-scored for simple polls
  scored: {type: Boolean, default: true},
  // Shove it to the top of the list in admin view?
  priority: {type: Boolean, default: false, index: true},
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
    this._showingLiveResults = false;
    this._cachedUserAnswers = {};
    this.showingVideo = '';
    this.showingBlackout = false;
    this.showingEndScreen = false;
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
  get showingLiveResults() {
    return this._showingLiveResults;
  }
  setQuestion(question) {
    this._activeQuestion = question;
    this._acceptingAnswers = true;
    this._revealingAnswers = false;
    this._showingLiveResults = false;
    this._cachedUserAnswers = {};
    this.showingVideo = '';
  }
  showLiveResults() {
    this._showingLiveResults = true;
    this.showingVideo = '';
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
    this._showingLiveResults = true;
    this.showingVideo = '';
  }
  revealAnswers() {
    if (!this._activeQuestion) throw Error("No active question");
    this._acceptingAnswers = false;
    this._revealingAnswers = true;
    this._showingLiveResults = true;
    this.showingVideo = '';
  }
  unsetQuestion() {
    this._activeQuestion = null;
    this._acceptingAnswers = false;
    this._revealingAnswers = false;
    this._showingLiveResults = false;
  }
  showLeaderboard() {
    this._showingLeaderboard = true;
    this.showingVideo = '';
  }
  hideLeaderboard() {
    this._showingLeaderboard = false;
  }
  getState() {
    return {
      question: this._activeQuestion && {
        id: this._activeQuestion._id,
        title: this._activeQuestion.title,
        text: this._activeQuestion.text,
        code: this._activeQuestion.code,
        codeType: this._activeQuestion.codeType,
        multiple: this._activeQuestion.multiple,
        scored: this._activeQuestion.scored,
        // Don't want to send which answers are correct all the time,
        // see `correctAnswers` below
        answers: this._activeQuestion.answers.map(answer => ({text: answer.text}))
      },
      showEndScreen: this.showingEndScreen,
      showLiveResults: this._showingLiveResults,
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
