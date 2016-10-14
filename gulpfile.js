const gulp = require('gulp');
const gulpProcess = require('gulp-process');
const gutil = require('gulp-util');
const babel = require('gulp-babel');
const sourcemaps = require('gulp-sourcemaps');
const handlebars = require('gulp-handlebars');
const debug = require('gulp-debug');
const gzip = require('gulp-gzip');
const defineModule = require('gulp-define-module');
const sass = require('gulp-sass');
const respawn = require('respawn');
const del = require('del');
const source = require('vinyl-source-stream');
const buffer = require('vinyl-buffer');
const rollup = require('rollup-stream');
const rollupBabel = require('rollup-plugin-babel');
const nodeResolve = require('rollup-plugin-node-resolve');
const commonjs = require('rollup-plugin-commonjs');

const paths = {
  serverScripts: {
    src: 'server/**/*.js',
    dest: 'build/'
  },
  serverTemplates: {
    src: 'server/templates/**/*.hbs',
    dest: 'build/templates'
  },
  components: {
    src: 'components/**/*.js',
    dest: 'build/components'
  },
  scss: {
    src: 'client/css/**/*.scss',
    dest: 'build/static/css'
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

process.on('uncaughtException', () => {
  serverProcess.stop();
  databaseProcess.stop();
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
      plugins: ["transform-es2015-modules-commonjs", ["transform-react-jsx", { "pragma":"h" }]]
    }))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(paths.serverScripts.dest));
}

function components() {
  return gulp.src(paths.components.src, {
    since: gulp.lastRun(components)
  }).pipe(sourcemaps.init())
    .pipe(babel({
      presets: ['stage-3'],
      plugins: ["transform-es2015-modules-commonjs", ["transform-react-jsx", { "pragma":"h" }]]
    }))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(paths.components.dest));
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
    .pipe(gulp.dest(paths.scss.dest))
    .pipe(gzip({skipGrowingFiles: true}))
    .pipe(gulp.dest(paths.scss.dest));
}

let cache;
function script() {
  return rollup({
    entry: './client/js/index.js',
    sourceMap: true,
    cache,
    plugins: [
      nodeResolve({
        browser: true,
        jsnext: true,
        main: true
      }),
      commonjs(),
      rollupBabel({
        presets: ['stage-3', ['es2015', {modules: false}]],
        plugins: [["transform-react-jsx", {pragma:"h"}], "external-helpers"]
      })
    ]
  }).on('bundle', function(bundle) {
    cache = bundle;
  }).pipe(source('index.js', './client/js/'))
    .pipe(buffer())
    .pipe(sourcemaps.init({loadMaps: true}))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('./build/static/js'))
    .pipe(gzip({skipGrowingFiles: true}))
    .pipe(gulp.dest('./build/static/js'));
}

function watch() {
  // server
  gulp.watch(paths.serverScripts.src, gulp.series(serverScripts, serverRestart));
  gulp.watch(paths.serverTemplates.src, gulp.series(serverTemplates, serverRestart));
  gulp.watch(paths.components.src, gulp.series(components, script, serverRestart));

  // client
  gulp.watch(paths.scss.src, scss);
  gulp.watch('./client/js/**/*.js', script);
}

gulp.task('serverTemplates', serverTemplates);

gulp.task('serve', gulp.series(
  clean,
  gulp.parallel(serverScripts, serverTemplates, components, scss, script),
  gulp.parallel(
    databaseServer,
    // Wait for database to start up
    // TODO: I should find a better way to do this
    gulp.series(waitTask(1500), server),
    watch
  )
));