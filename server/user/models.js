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

const userSchema = mongoose.Schema({
  googleId: {type: String, unique: true, required: true},
  name: {type: String, required: true},
  email: {type: String, required: true},
  avatarUrl: String,
  appearOnLeaderboard: {type: Boolean, index: true},
  answers: [
    {
      questionId: {type: ObjectId, required: true},
      answers: [Number]
    }
  ]
});

export const User = mongoose.model('User', userSchema);