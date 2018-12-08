const gulp = require('gulp');
const del = require('del');
const gutil = require('gulp-util');
const webpack = require('webpack');
const server = require('gulp-develop-server');
const notifier = require('node-notifier');
const lightReload = require('light-reload');
const useref = require('gulp-useref');
const gulpif = require('gulp-if');
const uglify = require('gulp-uglify');
const minifyCss = require('gulp-clean-css');

const showWebpackError = (err, stats) => {
  if (err) {
    throw new gutil.PluginError('webpack', err);
  }
  gutil.log(
    '[webpack:build-dev]',
    stats.toString({
      colors: true,
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
    })
  );
};

gulp.task('client:prd-build', callback => {
  let config = require('./build/webpack.prod.js');
  webpack(config, (err, stats) => {
    showWebpackError(err, stats);
    callback();
  });
});

gulp.task('client:dev-build', () => {
  let config = require('./build/webpack.dev.js');
  let compiler = webpack(config);
  compiler.watch(200, (err, stats) => {
    showWebpackError(err, stats);
    notifier.notify({
      title: 'Humpback-Client',
      message: 'Client build succeed.'
    });
    lightReload.reload();
  });
});

gulp.task('clean', () => {
  return del(['dist/*', '!dist/dbFiles', '!dist/node_modules'], { force: true });
});

gulp.task('server:clean', done => {
  del(['dist/**/*', '!dist/client'], { force: true });
  done();
});

gulp.task('server:copy', () => {
  return gulp.src(['src/server/**']).pipe(gulp.dest('dist/'));
});

gulp.task('server:start', callback => {
  lightReload.init();
  server.listen({ path: 'dist/index.js' }, err => {
    if (err) console.log('listen', err);
  });
  callback();
});

gulp.task('server:restart', callback => {
  server.restart(err => {
    if (err) console.log('restart', err);
    notifier.notify({
      title: 'Humpback-Server',
      message: 'Server restarted.'
    });
  });
  callback();
});

gulp.task('server:watch', done => {
  gulp.watch(['src/server/**/*.js'], gulp.series('server:reload'));
  done();
});

gulp.task('release:html', () => {
  return gulp
    .src('dist/client/index.html')
    .pipe(useref())
    .pipe(gulpif('*.js', uglify()))
    .pipe(gulpif('*.css', minifyCss()))
    .pipe(gulp.dest('dist/client'));
});

gulp.task('release:clean-unused-file', () => {
  let rootPath = 'dist/client/static';
  return del(
    [
      `${rootPath}/**/*.css`,
      `${rootPath}/**/*.js`,
      `!${rootPath}/vendor/css/vendor.min.css`,
      `!${rootPath}/vendor/js/vendor.min.js`,
      `!${rootPath}/css/site.min.css`,
      `!${rootPath}/js/site.min.js`
    ],
    { force: true }
  );
});

gulp.task('server:reload', gulp.series('server:copy', 'server:restart'));

gulp.task('dev', gulp.series('clean', 'server:copy', 'server:start', 'server:watch', 'client:dev-build'));

gulp.task(
  'release',
  gulp.series('clean', 'server:copy', 'client:prd-build', 'release:html', 'release:clean-unused-file')
);
