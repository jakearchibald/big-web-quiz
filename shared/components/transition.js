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
import { h, Component } from 'preact';

export default class Transition extends Component {
  constructor(props) {
    super(props);

    this.exitingChildEl = null;
    this.currentChildEl = null;
    this.shouldTransition = false;

    this.state = {
      exitingChild: null,
      currentChild: null
    };
  }
  async componentDidUpdate() {
    if (!this.shouldTransition) return;
    this.shouldTransition = false;

    if (this.props.onTransition) {
      await this.props.onTransition(
        this.state.exitingChild,
        this.exitingChildEl,
        this.state.currentChild,
        this.currentChildEl
      );
    }

    this.setState({exitingChild: null});
  }
  render({children}, state) {
    if (children.length > 1) throw Error('Only one child allowed in Transition');

    const child = children[0];
    
    if (!child.key) throw Error('Child must have key');

    const newChild = !state.currentChild || child.key != state.currentChild.key;
    this.shouldTransition = state.currentChild && newChild; 

    if (this.shouldTransition) {
      this.exitingChildEl = this.currentChildEl; 
      state.exitingChild = state.currentChild;
    }

    if (newChild) {
      const currentRef = child.attributes.ref;
      child.attributes.ref = el => {
        if (child.key != state.currentChild.key) return;
        this.currentChildEl = el;
        if (currentRef) currentRef(el);
      }
      state.currentChild = child;
    }

    return (
      <div class="transition-container">
        {state.exitingChild || <div/>}
        {state.currentChild || <div/>}
      </div>
    );
  }
}

Transition.defaultProps = {};