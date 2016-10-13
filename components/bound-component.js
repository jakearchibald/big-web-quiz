import {Component} from 'preact';

const onCaps = /^on[A-Z]/;

export default class BoundComponent extends Component {
  constructor() {
    super();

    // Bind all functions named on followed by an uppercase letter,
    // eg onClick, onLogout. This retains `this` in listeners.
    for (const propName of Object.getOwnPropertyNames(this.constructor.prototype)) {
      if (typeof this[propName] == 'function' && onCaps.test(propName)) {
        this[propName] = this[propName].bind(this);
      }
    }
  }
}