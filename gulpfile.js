const gulp = require('gulp');
const gulpProcess = require('gulp-process');
const gutil = require('gulp-util');
const babel = require('gulp-babel');
const respawn = require('respawn');

const paths = {
  serverScripts: {
    src: 'server/**/*.js',
    dest: 'server-build'
  }
};

const serverProcess = respawn(['node', `${paths.serverScripts.dest}/index.js`]);
serverProcess.on('stdout', data => gutil.log(data.toString('utf-8')));
serverProcess.on('stderr', data => gutil.log(data.toString('utf-8')));
serverProcess.on('warn', data => gutil.log(data.toString('utf-8')));

function serverScripts() {
  return gulp.src(paths.serverScripts.src, { 
    sourcemaps: true,
    since: gulp.lastRun(serverScripts)
  }).pipe(babel({
    presets: ['stage-3'],
    plugins: ["transform-es2015-modules-commonjs"]
  })).pipe(gulp.dest(paths.serverScripts.dest));
}

function server() {
  serverProcess.start();
}

function serverRestart(cb) {
  serverProcess.stop(() => {
    serverProcess.start();
    cb();
  });
}

function watch() {
  gulp.watch(paths.serverScripts.src, gulp.series(serverScripts, serverRestart));
}

gulp.task('serve', gulp.series(
  gulp.parallel(serverScripts),
  gulp.parallel(server, watch)
));