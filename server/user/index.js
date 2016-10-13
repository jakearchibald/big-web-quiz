import google from 'googleapis';

import mongoose from '../mongoose-db';
import promisify from '../promisify';
import {clientId, clientSecret, redirectOrigin} from '../settings';

const getToken = promisify();

function getAuthClient() {
  return new google.auth.OAuth2(
    clientId,
    clientSecret,
    redirectOrigin + '/oauth2callback'
  );
}

const userSchema = mongoose.Schema({
  googleId: {type: String, unique: true},
  name: String,
  email: String,
  avatarUrl: String
});

export const User = mongoose.model('User', userSchema);

export function generateAuthUrl() {
  const oauth2Client = getAuthClient();
  return oauth2Client.generateAuthUrl({
    scope: ['profile', 'email']
  });
}

export function authenticateUser(code) {
  const oauth2Client = getAuthClient();

  return promisify(oauth2Client, 'getToken')(code).then(tokens => {
    oauth2Client.setCredentials(tokens);
    const plus = google.plus('v1');
    return promisify(plus.people, 'get')({ userId: 'me', auth: oauth2Client });
  }).then(response => {
    return User.findOneAndUpdate({googleId: response.id}, {
      googleId: response.id,
      name: response.displayName,
      email: response.emails[0].value,
      avatarUrl: response.image.url
    }, {upsert: true});
  });
}
