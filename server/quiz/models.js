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
    text: {type: [String], required: true},
    correct: Boolean
  }]
});

export const Question = mongoose.model('Question', questionSchema);