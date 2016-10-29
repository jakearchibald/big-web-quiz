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

const context = new AudioContext();

function loadSoundAsAudioBuffer(url) {
  return fetch(url).then(r => r.arrayBuffer())
    .then(data => context.decodeAudioData(data));
}

function audioSourceFromBuffer(buffer) {
  const source = context.createBufferSource();
  source.buffer = buffer;
  return source;
}

const loopBuffer = loadSoundAsAudioBuffer('/static/audio/loop.wav');
const stabBuffer = loadSoundAsAudioBuffer('/static/audio/stab.mp3');

export default class Audio extends BoundComponent {
  constructor(props) {
    super(props);
    this.looping = false;
    this.loopSource = Promise.resolve();
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
    }

    if (!this.looping) {
      this.looping = true;
      this.loopSource = this.playLoop();
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
    const fadeInTime = 0.7;
    const loopSource = audioSourceFromBuffer(await loopBuffer);

    const gainNode = context.createGain();
    gainNode.gain.setValueAtTime(0.001, context.currentTime);
    gainNode.connect(context.destination);
    gainNode.gain.exponentialRampToValueAtTime(1, context.currentTime + fadeInTime);

    loopSource.connect(gainNode);
    loopSource.loop = true;
    loopSource.loopEnd = 6.841041667;
    loopSource.start(0, loopSource.loopEnd - fadeInTime);
    return loopSource;
  }

  async upgradeLoop() {
    const loopSource = await this.loopSource;
    loopSource.loopStart = 13.694375;
    loopSource.loopEnd = loopSource.buffer.duration;
  }

  async stopLoop() {
    const loopSource = await this.loopSource;
    loopSource.stop(context.currentTime + 0.5);
  }

  async playStab() {
    const stabSource = audioSourceFromBuffer(await stabBuffer);
    stabSource.connect(context.destination);
    stabSource.start(0);

    return stabSource;
  }
}