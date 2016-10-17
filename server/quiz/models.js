import mongoose from '../mongoose-db';

const questionSchema = mongoose.Schema({
  // The question
  text: {type: String, required: true},
  // Answers can optionally have a code example
  code: String,
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
  }
  get activeQuestion() {
    return this._activeQuestion;
  }
  get acceptingAnswers() {
    return this._acceptingAnswers;
  }
  setQuestion(question) {
    this._activeQuestion = question;
    this._acceptingAnswers = true;
    this._revealingAnswers = false;
  }
  closeForAnswers() {
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
  getState() {
    return {
      question: this._activeQuestion && {
        id: this._activeQuestion._id,
        text: this._activeQuestion.text,
        multiple: this._activeQuestion.multiple,
        // don't want to send which answers are correct :D
        answers: this._activeQuestion.answers.map(answer => ({text: answer.text}))
      },
      questionClosed: !this._acceptingAnswers,
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
