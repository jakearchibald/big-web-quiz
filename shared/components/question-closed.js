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
import { h } from 'preact';
import BoundComponent from './bound-component';

export default class QuestionClosed extends BoundComponent {
  render({presentation, state}) {
    let className = 'question-closed';

    if (state) {
      className = 'question-closed question-closed--active';
    }

    return (
      <div class={className}>
        <div class="question-closed__shadow-container">
          <div class="question-closed__shadow2px"></div>
          <div class="question-closed__shadow12px"></div>
        </div>
        <div class="question-closed__container">
          <div class="question-closed__sides">
            <div class="question-closed__front">
              <div class="question-closed__front-inner">
              { presentation ? 'Question closed' : 'Waiting for answer' }</div>
            </div>
            <div class="question-closed__back"></div>
          </div>
        </div>
      </div>
    );
  }
}
