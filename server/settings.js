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
import {production} from './utils';

export const cookieSecret = 'whoopwhoopwoooo';

// Google oauth
export const clientId = '439217562768-vnquvids3d3g5eoi7nqlm5aqksg0eh0r.apps.googleusercontent.com';
export const clientSecret = 'bI5ivMN0bhq3ZvoS_IS3egk0';
export const redirectOrigin = production ?
  'https://bigwebquiz.com':
  'http://localhost:3000';
