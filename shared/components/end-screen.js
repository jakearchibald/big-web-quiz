import { h } from 'preact';

const links = [
  [
    'A deep dive into script loading',
    'https://www.html5rocks.com/en/tutorials/speed/script-loading/'
  ],
  [
    'ES6 modules in depth',
    'https://ponyfoo.com/articles/es6-modules-in-depth'
  ],
  [
    'ES6 modules – the browser-specific stuff',
    'https://jakearchibald.com/2017/es-modules-in-browsers/'
  ],
  [
    'Using <link rel=preload>',
    'https://www.smashingmagazine.com/2016/02/preload-what-is-it-good-for/'
  ],
  [
    'Deep dive into HTTP/2 push and preloads',
    'https://jakearchibald.com/2017/h2-push-tougher-than-i-thought/'
  ],
  [
    'Streaming HTML/JSON using iframes and document.write',
    'https://jakearchibald.com/2016/fun-hacks-faster-content/'
  ],
  [
    'Chrome bug: Compositing within SVG',
    'https://bugs.chromium.org/p/chromium/issues/detail?id=675801'
  ],
  [
    'Anatomy of a frame',
    'https://aerotwist.com/blog/the-anatomy-of-a-frame/'
  ],
  [
    `The browser's event loop: Tasks vs microtasks`,
    'https://jakearchibald.com/2015/tasks-microtasks-queues-and-schedules/'
  ],
  [
    `visibility: visible undoes visibility: hidden`,
    'https://jakearchibald.com/2014/visible-undoes-hidden/'
  ],
  [
    'The code behind Big Web Quiz',
    'https://github.com/jakearchibald/big-web-quiz'
  ],
  [
    'How the Big Web Quiz music was scheduled',
    'https://jakearchibald.com/2016/sounds-fun/'
  ]
];

export default () => (
  <div class="end-screen">
    Thanks for playing! Here are some links:
    <ul class="end-screen__list">
      {links.map(([text, href]) =>
        <li class="end-screen__list-item">
          <a class="end-screen__list-item-link" href={href}>{text}</a>
        </li>
      )}
    </ul>
  </div>
);