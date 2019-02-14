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
const ObjectId = mongoose.Schema.Types.ObjectId;

export const ADMIN_IDS = [
  '116237864387312784020', // Jake
  '102813120987797040209', // Paul Lewis
  '104714371990859295637', // thebigwebquiz
  '111820256548303113275',  // surma
  '110684868935696470475'  // arunyokesh
];

let allowNaiveLogin = false;

export function naiveLoginAllowed() {
  return allowNaiveLogin;
}

export function setNaiveLogin(val) {
  allowNaiveLogin = !!val;
}

const userSchema = mongoose.Schema({
  googleId: {type: String, unique: true, required: true, index: true},
  name: {type: String, required: true, default: "Unknown name"},
  email: String,
  avatarUrl: {type: String, required: true, default: "/static/images/ic_tag_faces_white_18px.svg"},
  optIntoLeaderboard: {type: Boolean, required: true, default: true},
  bannedFromLeaderboard: {type: Boolean, required: true, default: false},
  // Optimisation. See `updateScore`.
  score: {type: Number, default: 0, index: true},
  answers: [
    {
      questionId: {type: ObjectId, required: true},
      choices: [Number]
    }
  ]
});

userSchema.index({ optIntoLeaderboard: 1, bannedFromLeaderboard: 1, score: -1 });

userSchema.methods.isAdmin = function() {
  return ADMIN_IDS.includes(this.googleId);
};

userSchema.statics.updateScores = function(questions) {
  return this.find().then(users => {
    for (const user of users) {
      let score = 0;

      for (const question of questions) {
        if (!question.scored) continue;

        const userAnswer = user.answers.find(answer => question._id.equals(answer.questionId));
        if (!userAnswer) continue;
        const choices = userAnswer.choices;

        if (question.multiple) {
          for (const [i, answer] of question.answers.entries()) {
            if (answer.correct === choices.includes(i)) {
              score++;
            }
          }
        }
        else {
          const correctIndex = question.answers.findIndex(a => a.correct);
          if (choices[0] == correctIndex) {
            score += 4;
          }
        }
      }

      user.score = score;
    }

    return Promise.all(users.map(u => u.save()));
  });
};

export const User = mongoose.model('User', userSchema);
