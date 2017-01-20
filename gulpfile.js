const gulp = require('gulp');
const del = require('del');
const gutil = require("gulp-util");
const webpack = require("webpack");
const server = require('gulp-develop-server');
const notifier = require('node-notifier');
const runSequence = require('run-sequence');
const lightReload = require('light-reload');

let wss;

gulp.task('client:prd-build', (callback) => {
  let config = require('./config/webpack.prod.js');
  webpack(config, (err, stats) => {
    showWebpackError(err, stats);
    callback();
  });
});

gulp.task('client:dev-build', () => {
  let config = require('./config/webpack.dev.js');
  webpack(config).watch(200, (err, stats) => {
    showWebpackError(err, stats);
    notifier.notify({
      title: 'Humpback-Client',
      message: 'Client build succeed.'
    });
    lightReload.reload();
  });
});

gulp.task('clean', () => {
  return del(['dist/*', '!dist/db'], { force: true });
});

gulp.task('server:clean', (callback) => {
  return del(['dist/**/*', '!dist/client'], { force: true });
})

gulp.task('server:copy', () => {
  return gulp.src(['src/server/**'])
    .pipe(gulp.dest('dist/'));
});

gulp.task('server:reload', (callback) => {
  runSequence('server:copy', 'server:restart', callback);
});

gulp.task('server:start', (callback) => {
  lightReload.init();
  server.listen({ path: 'dist/index.js' }, err => {
    if (err) console.log('listen', err);
  });
  callback();
});

gulp.task('server:restart', (callback) => {
  server.restart(err => {
    if (err) console.log('restart', err);
    notifier.notify({
      title: 'Humpback-Server',
      message: 'Server restarted.'
    });
  });
  callback();
});

gulp.task('server:watch', () => {
  return gulp.watch(['src/server/**/*.js'], ['server:reload']);
});

gulp.task('dev', (callback) => {
  runSequence(
    'clean',
    'server:copy',
    'server:start',
    'server:watch',
    'client:dev-build',
    callback);
});

gulp.task('release', (callback)=>{
  runSequence(
    'clean',
    'server:copy',
    'client:prd-build',
    callback);
})

let showWebpackError = (err, stats) => {
  if (err) {
    throw new gutil.PluginError('webpack', err);
  }
  let statColor = stats.compilation.warnings.length < 1 ? 'green' : 'yellow';
  if (stats.compilation.warnings.length > 0) {
    stats.compilation.errors.forEach(error => {
      statColor = 'red';
    });
  } else {
    gutil.log(stats.toString({
      colors: gutil.colors.supportsColor,
      hash: false,
      timings: true,
      chunks: true,
      chunkModules: false,
      modules: false,
      children: false,
      version: true,
      cached: true,
      cachedAssets: true,
      reasons: false,
      source: false,
      errorDetails: false
    }));
  }
};