var gulp = require('gulp');
var gutil = require('gulp-util');
var bower = require('bower');
var concat = require('gulp-concat');
var sass = require('gulp-sass');
var minifyCss = require('gulp-minify-css');
var rename = require('gulp-rename');
var sh = require('shelljs');
var order = require('gulp-order');

var paths = {
  sass        : ['./scss/**/*.scss'],
  controllers : ['./www/js/controllers/**/*.def.js', './www/js/controllers/**/*.js'],
  services : ['./www/js/services/**/*.def.js', './www/js/services/**/*.js'],
  directives : ['./www/js/directives/**/*.def.js', './www/js/directives/**/*.js']
};

gulp.task('default', ['sass']);

gulp.task('sass', function(done) {
  gulp.src('./scss/ionic.app.scss')
    .pipe(sass())
    .on('error', sass.logError)
    .pipe(gulp.dest('./www/css/'))
    .pipe(minifyCss({
      keepSpecialComments: 0
    }))
    .pipe(rename({ extname: '.min.css' }))
    .pipe(gulp.dest('./www/css/'))
    .on('end', done);
});

gulp.task('watch', function() {
  gulp.watch(paths.sass, ['sass']);
});

gulp.task('install', ['git-check'], function() {
  return bower.commands.install()
    .on('log', function(data) {
      gutil.log('bower', gutil.colors.cyan(data.id), data.message);
    });
});

gulp.task('git-check', function(done) {
  if (!sh.which('git')) {
    console.log(
      '  ' + gutil.colors.red('Git is not installed.'),
      '\n  Git, the version control system, is required to download Ionic.',
      '\n  Download git here:', gutil.colors.cyan('http://git-scm.com/downloads') + '.',
      '\n  Once git is installed, run \'' + gutil.colors.cyan('gulp install') + '\' again.'
    );
    process.exit(1);
  }
  done();
});



gulp.task('services', function() {
  gulp.src(paths.services)
    .pipe(concat('services.js'))
    .pipe(gulp.dest('./www/js/'))
});


gulp.task('controllers', function() {
  gulp.src(paths.controllers)
    .pipe(concat('controllers.js'))
    .pipe(gulp.dest('./www/js/'))
});


gulp.task('directives', function() {
  gulp.src(paths.directives)
    .pipe(concat('directives.js'))
    .pipe(gulp.dest('./www/js/'))
});


gulp.task('js', ['controllers', 'services', 'directives'], function() {

});