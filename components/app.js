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
import Intro from './intro';
import QuestionWaiting from './question-waiting';
import LoginStatus from './login-status';

export default class App extends BoundComponent {
  render({checkedLogin, user}) {
    return (
      <div>
        <LoginStatus user={user} server={true}/>
        {user ? <QuestionWaiting/> : <Intro/>}
      </div>
    );
  }
}