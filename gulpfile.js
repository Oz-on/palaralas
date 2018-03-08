var gulp = require('gulp');
var uglify = require('gulp-uglify');
var cleanCSS = require('gulp-clean-css');
var path = require('path');
var swPrecache = require('sw-precache');
/*
  -- TOP LEVEL FUNCTION
  gulp.task - define task
  gulp.src - point to files to use
  gulp.dest - points to folder to output
  gulp.watch - watch files and folders for changes
*/

//logs message
gulp.task('message', function () {
  return console.log('gulp is running...');
});

//minify js
gulp.task('minify-js', function () {
  gulp.src('app/scripts/*.js')
    .pipe(uglify())
    .pipe(gulp.dest('dist/scripts'));
});

//minify css
gulp.task('minify-css', function () {
  gulp.src('app/styles/*.css')
    .pipe(cleanCSS())
    .pipe(gulp.dest('dist/styles'));
});

//copy index html
gulp.task('copyHTML', function () {
  gulp.src('app/index.html')
    .pipe(gulp.dest('dist'));
});

//copy manifest file
gulp.task('copyManifest', function () {
  gulp.src('app/manifest.json')
    .pipe(gulp.dest('dist'));
});

//copy Images
gulp.task('copyImages', function () {
  gulp.src('app/images/*.png').pipe(gulp.dest('dist/images'));
})

//create service worker
gulp.task('generate-service-worker', function (callback) {
  var rootDir = 'dist';
  swPrecache.write(path.join(rootDir, 'sw.js'), {
    staticFileGlobs: [rootDir + '/**/*.{js,html,css,png}'],
    stripPrefix: rootDir
  }, callback);
});


gulp.task('default', ['copyHTML', 'copyManifest', 'copyImages', 'minify-js', 'minify-css', 'generate-service-worker']);
