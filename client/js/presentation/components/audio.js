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
import BoundComponent from '../../../../shared/components/bound-component';
import {wait} from '../../../../shared/utils';

const context = new AudioContext();

// 14.515229167 next loop start

function loadSoundAsAudioBuffer(url) {
  return fetch(url).then(r => r.arrayBuffer())
    .then(data => context.decodeAudioData(data));
}

const loop = loadSoundAsAudioBuffer('/static/audio/loop.wav');
const stab = loadSoundAsAudioBuffer('/static/audio/stab.mp3');

export default class Audio extends BoundComponent {
  constructor(props) {
    super(props);
    this.looping = false;
    this.playingLoop = Promise.resolve();
  }

  update({
    closed: previouslyClosed = false,
    stepItUp: alreadySteppingItUp = false
  }={}) {
    if (this.props.closed) {
      if (previouslyClosed) return;
      
      if (this.looping) {
        this.looping = false;
        this.stopLoop();
      }
      
      this.playStab();
      return;
    };

    if (!this.looping) {
      this.looping = true;
      this.playingLoop = this.playLoop();
    }
    if (this.props.stepItUp && !alreadySteppingItUp) {
      this.upgradeLoop();
    }
  }

  componentDidMount() {
    this.update();
  }

  componentDidUpdate(prevProps) {
    this.update(prevProps);
  }

  async playLoop() {
    const loopBuffer = await loop;

    const loopSource = context.createBufferSource();
    loopSource.buffer = loopBuffer;
    loopSource.connect(context.destination);
    loopSource.loop = true;
    loopSource.loopEnd = 6.841041667;
    loopSource.start(0);

    return loopSource;
  }

  async upgradeLoop() {
    const loopSource = await this.playingLoop;
    const {duration} = await loop;
    loopSource.loopStart = 13.694375;
    loopSource.loopEnd = duration;
  }

  async stopLoop() {
    const loopSource = await this.playingLoop;
    await wait(500);
    loopSource.stop();
  }

  async playStab() {
    const stabBuffer = await stab;

    const stabSource = context.createBufferSource();
    stabSource.buffer = stabBuffer;
    stabSource.connect(context.destination);
    stabSource.start(0);

    return stabSource;
  }
}