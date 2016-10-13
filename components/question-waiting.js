import { h } from 'preact';
import BoundComponent from './bound-component';

export default class QuestionWaiting extends BoundComponent {
  render() {
    return (
      <div>Waiting for a question</div>
    );
  }
}