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

export default class Transition extends BoundComponent {
  constructor(props) {
    super(props);
    this.expectingTransitionOutCall = false;

    this.state = {
      exitingChild: null,
      currentChild: null
    };
  }
  async transitionOut(vEl, promise) {
    if (!this.state.exitingChild || this.state.exitingChild.key != vEl.key) {
      return;
    }

    this.expectingTransitionOutCall = false;
    await promise;
    this.setState({exitingChild: null});
  }
  componentDidUpdate() {
    if (this.expectingTransitionOutCall) {
      this.expectingTransitionOutCall = false;
      this.setState({exitingChild: null});
    }
  }
  render({children}, state) {
    if (children.length > 1) throw Error('Only one child allowed in Transition');

    const child = children[0];

    if (!child.key) throw Error('Child must have key');

    if (state.currentChild && child.key != state.currentChild.key) {
      this.expectingTransitionOutCall = true;
      state.exitingChild = state.currentChild;
      state.currentChild = child;
      state.exitingChild.attributes.transitionOut = p => { this.transitionOut(state.exitingChild, p); };
    }

    state.currentChild = child;

    const els = [];
    if (state.exitingChild) els.push(state.exitingChild);
    if (state.currentChild) els.push(state.currentChild);

    return <div class="container">{els}</div>;
  }
}

Transition.defaultProps = {};