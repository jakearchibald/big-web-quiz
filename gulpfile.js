const gulp = require('gulp');
const gulpProcess = require('gulp-process');
const gutil = require('gulp-util');
const babel = require('gulp-babel');
const sourcemaps = require('gulp-sourcemaps');
const handlebars = require('gulp-handlebars');
const debug = require('gulp-debug');
const defineModule = require('gulp-define-module');
const sass = require('gulp-sass');
const respawn = require('respawn');
const del = require('del');

const paths = {
  serverScripts: {
    src: 'server/**/*.js',
    dest: 'build/server'
  },
  serverTemplates: {
    src: 'server/templates/**/*.hbs',
    dest: 'build/server/templates'
  },
  scss: {
    src: 'client/css/**/*.scss',
    dest: 'build/client/css'
  }
};

const serverProcess = respawn(['node', `${paths.serverScripts.dest}/index.js`]);
const databaseProcess = respawn(['docker', 'start', '-a', 'bwq-mongo']);

// hook up the logging
for (const process of [serverProcess, databaseProcess]) {
  process.on('stdout', data => gutil.log(data.toString('utf-8')));
  process.on('stderr', data => gutil.log(data.toString('utf-8')));
  process.on('warn', data => gutil.log(data.toString('utf-8')));
}

// shut down gracefully
process.on('SIGINT', () => {
  serverProcess.stop(() => {
    databaseProcess.stop(() => {
      process.exit();
    });
  });
});

// TASKS:

function waitTask(ms) {
  return () => new Promise(r => setTimeout(r, ms));
}

function clean() {
  return del(['build']);
}

function serverScripts() {
  return gulp.src(paths.serverScripts.src, {
    since: gulp.lastRun(serverScripts)
  }).pipe(sourcemaps.init())
    .pipe(babel({
      presets: ['stage-3'],
      plugins: ["transform-es2015-modules-commonjs"]
    }))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(paths.serverScripts.dest));
}

function serverTemplates() {
  return gulp.src(paths.serverTemplates.src, {
    since: gulp.lastRun(serverTemplates)
  }).pipe(handlebars())
    .pipe(defineModule('node'))
    .pipe(gulp.dest(paths.serverTemplates.dest)); 
}

function server() {
  serverProcess.start();
}

function databaseServer() {
  databaseProcess.start();
}

function serverRestart(cb) {
  serverProcess.stop(() => {
    serverProcess.start();
    cb();
  });
}

function scss() {
  return gulp.src(paths.scss.src, {
    since: gulp.lastRun(scss)
  }).pipe(sourcemaps.init())
    .pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(paths.scss.dest));
}

function watch() {
  // server
  gulp.watch(paths.serverScripts.src, gulp.series(serverScripts, serverRestart));
  gulp.watch(paths.serverTemplates.src, gulp.series(serverTemplates, serverRestart));

  // client
  gulp.watch(paths.scss.src, scss);
}

gulp.task('serverTemplates', serverTemplates);

gulp.task('serve', gulp.series(
  clean,
  gulp.parallel(serverScripts, serverTemplates, scss),
  gulp.parallel(
    databaseServer,
    // Wait for database to start up
    // TODO: I should find a better way to do this
    gulp.series(waitTask(1500), server),
    watch
  )
));