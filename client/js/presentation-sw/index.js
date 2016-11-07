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
const staticCache = 'presentation-static-v1';
const allowedCaches = [staticCache];

async function createRangedResponse(request, response) {
  if (!response) return response;

  const rangeHeader = (request.headers.get('Range') || '').trim().toLowerCase();

  // not a range request
  if (!rangeHeader) {
    return response;
  } 

  // already a range response, or an error, or an opaque response
  // TODO: if response is 404 should this turn into 416 range not satisfiable?
  if (response.status != 200) {
    return response;
  }

  const buffer = await response.arrayBuffer(); 

  if (!rangeHeader.startsWith('bytes=')) return new Response("Invalid range unit", {status: 400});

  let start, end;
  const rangeParts = /(\d*)-(\d*)/.exec(rangeHeader);

  if (!rangeParts[1] && !rangeParts[2]) return new Response("Invalid range header", {status: 400});

  if (rangeParts[1] === '') {
    start = buffer.byteLength - Number(rangeParts[2]);
    end = buffer.byteLength;
  }
  else if (rangeParts[2] === '') {
    start = Number(rangeParts[1]);
    end = buffer.byteLength;
  }
  else {
    start = Number(rangeParts[1]);
    end = Number(rangeParts[2]) + 1; // range values are inclusive
  }

  if (end > buffer.byteLength || start < 0) return new Response("Range Not Satisfiable", {status: 416});

  const slicedBuffer = buffer.slice(start, end);
  const slicedResponse = new Response(slicedBuffer, {
    status: 206,
    headers: response.headers
  });

  slicedResponse.headers.set('Content-Length', slicedBuffer.byteLength);
  slicedResponse.headers.set('Content-Range', `bytes ${start}-${end - 1}/${buffer.byteLength}`);
  return slicedResponse;
}

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil((async () => {
    const cache = await caches.open(staticCache);
    await cache.addAll([
      '/static/audio/loop1.wav',
      '/static/audio/loop2.wav',
      '/static/audio/stab.wav',
      '/static/video/intro.mp4'
    ]);
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(
      keys.map(key => {
        if (key.startsWith('presentation-') && !allowedCaches.includes(key)) {
          return caches.delete(key);
        }
      })
    )
  })());
});

self.addEventListener('fetch', event => {
  event.respondWith((async () => {
    const cachedResponse = await caches.match(event.request);
    if (cachedResponse) return createRangedResponse(event.request, cachedResponse);
    return fetch(event.request);
  })());
});