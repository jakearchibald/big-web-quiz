import { h } from 'preact';
import BoundComponent from './bound-component';
import {Login} from './user';

export default class Intro extends BoundComponent {
  render() {
    return (
      <div>
        Welcome to the big web quiz! First you need to log in:
        <Login/>
      </div>
    );
  }
}