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
import {Component} from 'preact';

const onCaps = /^on[A-Z]/;

export default class BoundComponent extends Component {
  constructor() {
    super();

    // Bind all functions named on followed by an uppercase letter,
    // eg onClick, onLogout. This retains `this` in listeners.
    for (const propName of Object.getOwnPropertyNames(this.constructor.prototype)) {
      if (typeof this[propName] == 'function' && onCaps.test(propName)) {
        this[propName] = this[propName].bind(this);
      }
    }
  }
}