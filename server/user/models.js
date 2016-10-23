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

const ADMIN_IDS = [
  '116237864387312784020', // Jake
  '102813120987797040209' // Paul Lewis
];

const userSchema = mongoose.Schema({
  googleId: {type: String, unique: true, required: true},
  name: {type: String, required: true},
  email: {type: String, required: true},
  avatarUrl: String,
  appearOnLeaderboard: {type: Boolean, index: true},
  // Optimisation. See `updateScore`.
  score: {type: Number, default: 0},
  answers: [
    {
      questionId: {type: ObjectId, required: true},
      choices: [Number]
    }
  ]
});

userSchema.index({ appearOnLeaderboard: 1, score: -1 });

userSchema.methods.isAdmin = function() {
  return ADMIN_IDS.includes(this.googleId);
};

userSchema.statics.updateScores = function(questions) {
  return this.find().then(users => {
    for (const user of users) {
      let score = 0;

      for (const question of questions) {
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
            score += 5;
          }
        }
      }

      user.score = score;
    }

    return Promise.all(users.map(u => u.save()));
  });
};

export const User = mongoose.model('User', userSchema);