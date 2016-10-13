# Prerequisites

* Node >= 6.7.0
* Docker >= 1.12.1

And `server/settings.js` should look like:

```js
export const cookieSecret = '';

// Google oauth
export const clientId = '';
export const clientSecret = '';
export const redirectOrigin = '';
```

…but with the correct values.

# To install

```sh
npm install # or yarn
npm run install-mongo
```

# To run

```sh
npm run serve
```