import { h } from 'preact';
import BoundComponent from './bound-component';
import Intro from './intro';
import QuestionWaiting from './question-waiting';
import LoginStatus from './login-status';

export default class App extends BoundComponent {
  render({checkedLogin, user}) {
    return (
      <div>
        <LoginStatus user={user} server={true}/>
        {user ? <QuestionWaiting/> : <Intro/>}
      </div>
    );
  }
}