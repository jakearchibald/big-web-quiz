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

function wait(ms) {
  return new Promise(r => setTimeout(r, ms));
}

function loadSoundAsAudioBuffer(url) {
  return fetch(url).then(r => r.arrayBuffer())
    .then(data => context.decodeAudioData(data));
}

function audioSourceFromBuffer(buffer) {
  const source = context.createBufferSource();
  source.buffer = buffer;
  return source;
}

function onBarSwitchTime(playTime, loopStart, loopBarLength) {
  const loopPlaytime = playTime - loopStart;
  const timeInBar = loopPlaytime % loopBarLength;
  let untilSwitch = loopBarLength - timeInBar;
  if (untilSwitch < safetyOffset) untilSwitch += loopBarLength;

  return untilSwitch + playTime;
}

const safetyOffset = 0.25;
const loop1Buffer = loadSoundAsAudioBuffer('/static/audio/loop1.wav');
const loop1BarLength = (60 / 110 /*BPM*/) * 4;
const loop2Buffer = loadSoundAsAudioBuffer('/static/audio/loop2.wav');
const loop2BarLength = (60 / 123 /*BPM*/) * 4;
const stabBuffer = loadSoundAsAudioBuffer('/static/audio/stab.wav');

export default class Audio extends BoundComponent {
  constructor(props) {
    super(props);
    this.initialLoopPlaying = false;
    this.loop1Start = 0;
    this.loop2Start = 0;
    this.loop1Source = Promise.resolve();
    this.loop2Source = Promise.resolve();
    this.childrenChangeQueue = Promise.resolve();
    this.state = {
      children: null
    };
  }

  update({closed, stepItUp, children}, {
    closed: previouslyClosed = false,
    stepItUp: alreadySteppingItUp = false
  }={}) {

    if (closed) {
      if (previouslyClosed) {
        this.childrenChangeQueue = this.childrenChangeQueue.then(() => {
          this.setState({ children });
        });
        return;
      }

      this.initialLoopPlaying = false;
      const p = this.playStab();
      this.childrenChangeQueue = this.childrenChangeQueue.then(() => p).then(() => {
        this.setState({children});
      });
      return;
    }

    if (!this.initialLoopPlaying && !stepItUp) {
      this.initialLoopPlaying = true;
      this.playLoop();
      this.childrenChangeQueue = this.childrenChangeQueue.then(() => {
        this.setState({children});
      });
      return;
    }

    if (stepItUp && !alreadySteppingItUp) {
      this.initialLoopPlaying = false;
      const p = this.upgradeLoop();
      this.childrenChangeQueue = this.childrenChangeQueue.then(() => p).then(() => {
        this.setState({children});
      });
      return;
    }

    this.childrenChangeQueue = this.childrenChangeQueue.then(() => {
      this.setState({children});
    });
  }

  componentWillMount() {
    this.update(this.props);
  }

  componentWillReceiveProps(nextProps) {
    this.update(nextProps, this.props);
  }

  playLoop() {
    this.loop1Source = new Promise(async resolve => {
      const loop1Source = audioSourceFromBuffer(await loop1Buffer);
      const loop2Source = await this.loop2Source;

      // this would only happen if we go from "revealing" back to activate
      if (loop2Source) {
        this.loop2Source = Promise.resolve();
        loop2Source.stop();
      } 

      loop1Source.connect(context.destination);
      loop1Source.loop = true;

      this.loop1Start = context.currentTime + safetyOffset;
      loop1Source.start(this.loop1Start);
      resolve(loop1Source);
    });
  }

  upgradeLoop() {
    const loop1SourcePromise = this.loop1Source;
    this.loop1Source = Promise.resolve();

    return new Promise(outerResolve => {
      this.loop2Source = new Promise(async resolve => {
        const loop2Source = audioSourceFromBuffer(await loop2Buffer);
        const loop1Source = await loop1SourcePromise;

        loop2Source.connect(context.destination);
        loop2Source.loop = true;

        const switchTime = onBarSwitchTime(context.currentTime, this.loop1Start, loop1BarLength);
        outerResolve(wait((switchTime - context.currentTime) * 1000));

        this.loop2Start = switchTime;
        if (loop1Source) loop1Source.stop(switchTime);
        loop2Source.start(switchTime);
        resolve(loop2Source);
      });
    });
  }

  async playStab() {
    const loop1SourcePromise = this.loop1Source;
    const loop2SourcePromise = this.loop2Source;
    this.loop2Source = Promise.resolve();

    const stabSource = audioSourceFromBuffer(await stabBuffer);
    const loop1Source = await loop1SourcePromise;
    const loop2Source = await loop2SourcePromise;

    stabSource.connect(context.destination);

    let switchTime = context.currentTime;

    if (loop2Source) {
      switchTime = onBarSwitchTime(context.currentTime, this.loop2Start, loop2BarLength);
      loop2Source.stop(switchTime);
    }
    else if (loop1Source) {
      switchTime = onBarSwitchTime(context.currentTime, this.loop1Start, loop1BarLength);
      loop1Source.stop(switchTime);
    }

    stabSource.start(switchTime);

    return wait((switchTime - context.currentTime) * 1000);
  }

  render(props, {children}) {
    return <div class="presentation-wrapper">{children}</div>;
  }
}