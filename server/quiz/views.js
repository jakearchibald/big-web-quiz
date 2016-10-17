import {Question, Quiz} from './models';
import {longPollers} from '../long-pollers/views'

export const quiz = new Quiz();
longPollers.broadcast(quiz.getState());

export function allQuestionsJson(req, res) {
  Question.find().then(questions => {
    res.json(questions);
  });
}

export function deleteQuestionJson(req, res) {
  Question.findByIdAndRemove(req.body.id).then(() => {
    res.json({});
  }).catch(err => {
    res.status(500).json({err: err.message});
  });
}

export function updateQuestionJson(req, res) {
  const update = {
    text: req.body.text,
    code: req.body.code,
    multiple: !!req.body.multiple,
    answers: req.body.answers,
  };

  if (!Array.isArray(update.answers)) {
    update.answers = [];
  }

  // remove answers without text
  update.answers = update.answers.filter(answer => String(answer.text).trim());

  if (!update.answers.length) {
    // TODO update status code
    res.status(500).json({err: "No answers provided"});
    return;
  }

  let p;

  if (req.body.id) {
    p = Question.findByIdAndUpdate(req.body.id, update, {new: true});
  }
  else {
    p = new Question(update).save();
  }

  p.then(newQuestion => {
    if (!newQuestion) throw Error('No record found');
    res.json({question: newQuestion});
  }).catch(err => {
    res.status(500).json({err: err.message});
  });
}

export function setQuestionJson(req, res) {
  Question.findById(req.body.id).then(question => {
    if (!question) {
      res.status(404).json({err: "Question not found"});
      return;
    }

    quiz.setQuestion(question);
    longPollers.broadcast(quiz.getState());

    res.json({});
  }).catch(err => {
    res.status(500).json({err: err.message});
  });;
}