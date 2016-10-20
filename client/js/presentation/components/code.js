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
import {h} from 'preact';
import Prism from 'prismjs';
import BoundComponent from '../../../../shared/components/bound-component';

export default class Code extends BoundComponent {
  constructor(props) {
    super(props);
    this.pre = null;
  }
  shouldComponentUpdate(nextProps) {
    return nextProps.code != this.props.code ||
      nextProps.codeType != this.props.codeType;
  }
  highlightCode() {
    Prism.highlightElement(this.pre);
  }
  componentDidMount() {
    this.highlightCode();
  }
  componentDidUpdate({code: oldCode}) {
    this.highlightCode();
  }
  render({code, codeType}) {
    return (
      <pre ref={el => this.pre = el} class={`language-${codeType}`}>
        <code>{code}</code>
      </pre>
    );
  }
}