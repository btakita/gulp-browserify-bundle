var gulp = require('gulp')
  , size = require('gulp-size')
  , watchify = require('watchify')
  , rename = require('gulp-rename')
  , uglify = require('gulp-uglify')
  , runSequence = require('run-sequence')
  , browserify = require('browserify')
  , source = require('vinyl-source-stream')
  , buffer = require('vinyl-buffer')
  , sourcemaps = require('gulp-sourcemaps')
  , gutil = require('gulp-util')
  , path = require('path')
  ;
function browserifyBundle(params) { function noop() {};
  var taskBasename = params.taskBasename
    , sourceBasename = params.sourceBasename
    , dest = params.dest
    , destBasename = path.basename(dest)
    , destMin = params.destMin
    , browserifyParams = params.browserifyParams
    , browserifyFn = params.browserifyFn || browserify
    , uglifyParams = params.uglifyParams
    , transformFn = params.transformFn || browserifyBundle.transformFn || noop
    , endFn = params.endFn || browserifyBundle.endFn || noop
    ;
  var self = {
    browserifyParams: browserifyParams,
    browserify: browserifyFn,
    source: function() {
      return source(sourceBasename);
    },
    rename: function() {
      return rename(destBasename);
    },
    watchify: watchify(
      browserifyFn(Object.assign({}, watchify.args, browserifyParams)),
      {poll: true}
    ),
    params: params
  };
  self.watchify.on('update', function() {
    browserifyChain2(self.watchify, self, function() {
      runSequence(taskBasename+':minify');
    });
  });
  self.watchify.on('log', gutil.log);
  gulp.task(taskBasename+':browserify', function() {
    return runSequence(taskBasename+':browserify2', taskBasename+':minify');
  });
  gulp.task(taskBasename+':browserify2', function() {
    return browserifyChain(self.browserify(self.browserifyParams), self);
  });
  gulp.task(taskBasename+':watchify', function() {
    return runSequence(taskBasename+':watchify2', taskBasename+':minify');
  });
  gulp.task(taskBasename+':watchify2', function() {
    return browserifyChain(self.watchify, self);
  });
  gulp.task(taskBasename+':minify', function() {
    return gulp
      .src(dest)
      .pipe(rename(path.basename(destMin)))
      .pipe(uglify(uglifyParams))
      .pipe(gulp.dest(path.dirname(destMin)))
      .pipe(size({title: destBasename+' gzip size', gzip: true}))
      ;
  });
  return self;
  function browserifyChain(b, params2) {
    return browserifyChain2(
      transformFn(b),
      params2
    );
  }
  function browserifyChain2(b, params2, cb) {
    var cb2 = cb || function() {};
    return b.bundle()
      .pipe(params2.source())
      .pipe(params2.rename())
      .pipe(buffer()) // optional,buffer file contents
      .pipe(sourcemaps.init({loadMaps: true})) // optional, loads map from browserify file
      .pipe(sourcemaps.write('./')) // writes .map file
      .pipe(gulp.dest(path.dirname(dest)))
      .on('end', function() {
        endFn(self);
        cb2();
      })
      .on('error', function(err) {
        console.error('Browserify Error:', err);
      })
      ;
  }
}
browserifyBundle.config = function config(params) {
  browserifyBundle.endFn = params.endFn;
  browserifyBundle.transformFn = params.transformFn;
  return browserifyBundle;
};
module.exports = browserifyBundle;
