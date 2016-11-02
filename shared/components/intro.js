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
import {Login} from './user';

export default class Intro extends BoundComponent {
  render() {
    return (
      <div class="intro">
        <img class="intro__icon" width="96" src="/static/images/icon@192.png" alt="The Big Web Quiz!" />
        <p>Welcome to the Big Web Quiz! First you need to log in:</p>
        <Login/>

        <p class="intro__explainer">When you login we will store your Google information, such as name and email address. You can unregister at any time by clicking on your avatar and choosing "Unregister".</p>
      </div>
    );
  }
}