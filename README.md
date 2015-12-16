# gulp-browserify-bundle
A recipe for a gulp &amp; browserify build.

## Usage

~~~javascript
// gulpfile.js
var browserify = require('browserify');
var browserifyBundle = require('gulp-browserify-bundle');
var coreBundle = browserifyBundle({
  taskBasename: 'core-bundle',
  sourceBasename: 'dom.bundle.js',
  dest: './public/dist/core.js',
  destMin: './public/dist/core.min.js',
  browserifyParams: {
    entries: ['./core/dom.bundle.js'],
    extensions: ['*.js']
  },
  browserifyFn: function(browserifyParams) {
    return browserify(browserifyParams);
  },
  uglifyParams: {}
});
~~~

## Your own gulp-browserify-bundle build

Feel free to make your own npm package.

I like the idea of appending a number at the end.

`gulp-browserify-bundle-2`
