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

export default class Audio extends BoundComponent {

  constructor(props) {
    super(props);
    this.state = {
      context: new AudioContext()
    };

    this._init = Promise.all([
      this.loadSoundAsAudioBuffer('/static/audio/loop.wav'),
      this.loadSoundAsAudioBuffer('/static/audio/stab.wav')
    ]);
  }

  loadSoundAsAudioBuffer (url) {
    return fetch(url)
        .then(r => r.blob())
        .then(audioBlob => {
          return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.addEventListener('load', _ => {
              resolve(reader.result);
            });
            reader.addEventListener('error', reject);
            reader.readAsArrayBuffer(audioBlob);
          });
        })
        .then(data => {
          return new Promise((resolve, reject) => {
            this.state.context.decodeAudioData(data, resolve, reject);
          });
        })
        .catch(e => console.warn('No sounds'));
  }

  componentDidMount () {
    if (this.props.closed) {
      return;
    }

    this.playLoop();
  }

  componentWillUpdate (newProps) {
    if (newProps.closed === this.props.closed) {
      return;
    }

    if (newProps.closed) {
      this.playSting();
    }
  }

  playLoop () {
    this._init.then(sounds => {
      if (!sounds) {
        return;
      }

      if (this.state.sting) {
        this.state.sting.stop();
        this.state.sting = null;
      }

      const sfx = sounds[0];
      const context = this.state.context;
      this.state.loop = context.createBufferSource();
      this.state.loop.buffer = sfx;
      this.state.loop.connect(context.destination);
      this.state.loop.start(0);
    });
  }

  playSting () {
    this._init.then(sounds => {
      if (!sounds) {
        return;
      }

      if (this.state.loop) {
        setTimeout(_ => {
          this.state.loop.stop();
          this.state.loop = null;
        }, 500);
      }

      const sfx = sounds[1];
      const context = this.state.context;
      this.state.sting = context.createBufferSource();
      this.state.sting.buffer = sfx;
      this.state.sting.connect(context.destination);
      this.state.sting.start(0);
    });
  }

  render() {
    return (<div class="audio"></div>);
  }
}