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
import BoundComponent from './bound-component';

export class Login extends BoundComponent {
  constructor(props) {
    super(props);
  }
  render({naiveLoginAllowed}) {
    return (
      <div class="login-forms">
        <form action="/login" method="POST"><button class="google-signin">Sign in</button></form>
        {naiveLoginAllowed &&
          <div class="naive-login">
            <p>Or just type a name:</p>
            <form action="/naive-login" method="POST">
              <input type="text" name="name" maxlength="25"/><button>Go</button>
            </form>
          </div>
        }
      </div>
    );
  }
}

export class Logout extends BoundComponent {
  constructor(props) {
    super(props);
    this.logoutUrl = '/logout';
  }
  onSubmit(event) {
    event.preventDefault();

    fetch(this.logoutUrl + '.json', {
      method: 'POST',
      credentials: 'include'
    }).then(() => {
      this.props.onLogout();
    });
  }
  render(props, state) {
    return (
      <form class="logout-form" action={this.logoutUrl} method="POST" onSubmit={this.onSubmit}>
        <button>Sign out</button>
      </form>
    );
  }
}

Logout.defaultProps = {
  onLogout: function(){}
};