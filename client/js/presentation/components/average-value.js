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

export default class AverageValue extends BoundComponent {

  constructor(props) {
    super(props);
    this.state = {
      animating: false,
      value: props.targetValue || 0,
      targetValue: props.targetValue || 0,
      visible: false
    };
  }

  componentDidMount () {
    window.addEventListener('resize', this.onResize);

    requestAnimationFrame(_ => {
      this.onResize();
      this.state.visible = true;
      this.forceUpdate();
    });
  }

  componentWillUnmount () {
    window.removeEventListener('resize', this.onResize);
  }

  onResize () {
    // Reset the canvas.
    this.canvas.style.display = 'none';

    const containerSize = this.container.getBoundingClientRect();
    const dPR = window.devicePixelRatio;

    this.height = this.width = containerSize.width;

    this.canvas.width = this.width * dPR;
    this.canvas.height = this.height * dPR;

    this.canvas.style.width = `${this.width}px`;
    this.canvas.style.height = `${this.height}px`;
    this.canvas.style.display = 'block';

    this.ctx = this.canvas.getContext('2d');
    this.ctx.scale(dPR, dPR);

    this.draw();
  }

  update () {
    this.state.value += (this.state.targetValue - this.state.value) / 6;

    if (Math.abs(this.state.targetValue - this.state.value) < 0.001) {
      this.state.value = this.state.targetValue;
      this.state.animating = false;
    }

    this.draw();

    if (this.state.targetValue !== this.state.value && this.state.animating) {
      requestAnimationFrame(_ => this.update());
    }
  }

  draw () {
    const diameter = Math.max(0, Math.min(this.width, this.height) - 4);
    const radius = diameter / 2;
    const radiusInner = Math.round(radius * 0.8);
    const TAU = Math.PI * 2;
    const midX = this.width * 0.5;
    const midY = this.height * 0.5;
    const START_ANGLE = TAU * 1.35;
    const ANGLE_RANGE = TAU * 0.8;
    const VALUE_PERC = Math.round(this.state.value * 100);

    // Get rid of any old stuff.
    this.ctx.save();
    this.ctx.clearRect(0, 0, this.width, this.height);

    // White background.
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    this.ctx.beginPath();
    this.ctx.arc(midX, midY, radius, 0, TAU);
    this.ctx.closePath();
    this.ctx.fill();

    // Value.
    this.ctx.fillStyle = this.props.color;
    this.ctx.beginPath();
    this.ctx.moveTo(midX, midY);
    this.ctx.lineTo(
        midX + Math.cos(START_ANGLE) * diameter,
        midY + Math.sin(START_ANGLE) * diameter);
    this.ctx.arc(midX, midY, radius + 1, START_ANGLE, START_ANGLE +
        (ANGLE_RANGE * this.state.value));
    this.ctx.lineTo(midX, midY);
    this.ctx.closePath();
    this.ctx.fill();

    // Punch through with an inner dial and a triangle.
    this.ctx.save();
    this.ctx.globalCompositeOperation = 'destination-out';
    this.ctx.fillStyle = '#F0F';

    // Inner Dial
    this.ctx.beginPath();
    this.ctx.arc(midX, midY, radiusInner, 0, TAU);
    this.ctx.closePath();
    this.ctx.fill();

    // Inner Triangle
    this.ctx.beginPath();
    this.ctx.moveTo(midX, midY);
    this.ctx.lineTo(
        midX + Math.cos(START_ANGLE) * diameter,
        midY + Math.sin(START_ANGLE) * diameter);
    this.ctx.lineTo(
        midX + Math.cos(START_ANGLE + ANGLE_RANGE) * diameter,
        midY + Math.sin(START_ANGLE + ANGLE_RANGE) * diameter);
    this.ctx.closePath();
    this.ctx.fill();

    this.ctx.restore();

    // Write the actual value in the middle.
    this.ctx.fillStyle = this.props.color;
    this.ctx.font = '700 48px Roboto';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText(VALUE_PERC + '%', midX, midY);
    this.ctx.restore();
  }

  componentDidUpdate(oldProps, oldState) {
    this.state.targetValue = this.props.targetValue;
    if (this.state.animating) {
      return;
    }

    this.state.animating = true;
    requestAnimationFrame(_ => this.update());
  }

  render({id, targetValue, color, text, questionClosed}, {value, visible}) {
    return (
      <div class={
        visible ?
        'average-value average-value--visible' :
        'average-value'
      } ref={container => this.container = container}>
        <canvas ref={canvas => this.canvas = canvas}></canvas>
        <div class={
          questionClosed ?
            'average-value__text average-value__text--visible' :
            'average-value__text'
        }>
          {text}
        </div>
      </div>
    );
  }
}