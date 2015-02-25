'use strict';

var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var browserSync = require('browser-sync');
var reload = browserSync.reload;

gulp.task('styles', function () {
  return gulp.src('app/styles/main.scss')
    .pipe($.sourcemaps.init())
    .pipe($.sass({
      outputStyle: 'nested',
      precision: 10,
      includePaths: ['.'],
      onError: console.error.bind(console, 'Sass error:')
    }))
    .pipe($.postcss([
      require('autoprefixer-core')({browsers: ['last 1 version']})
    ]))
    .pipe($.sourcemaps.write())
    .pipe(gulp.dest('.tmp/styles'))
    .pipe(reload({stream: true}));
});

gulp.task('js', function() {
  return gulp.src('app/scripts/flexy.js')
    .pipe($.babel())
    .pipe(gulp.dest('app/scripts'));
});

gulp.task('serve', ['styles', 'js'], function() {
  browserSync({
    notify: false,
    server: {
      baseDir: ['.tmp', 'app'],
      routes: {
        '/bower_components':'bower_components'
      }
    }
  });

  gulp.watch([
    'app/*.html',
  ]).on('change', reload);

  gulp.watch('app/styles/**/*.scss', ['styles']);
  gulp.watch('app/scripts/**/*.js', ['js']);
});

gulp.task('default', ['serve']);
