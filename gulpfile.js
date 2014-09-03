// REQUIRE ALL THINGS!!
var gulp = require('gulp');
var clean = require('gulp-clean');
var watch = require('gulp-watch');
var concat = require('gulp-concat');
var markdown = require('gulp-markdown');
var Handlebars = require('handlebars');
var tap = require('gulp-tap');
var Stream = require('stream');
var gStreamify = require('gulp-streamify');
var rename = require('gulp-rename');
var Path = require('path');
var buffer = require('buffer');
var moment = require('moment')
var _ = require('underscore');

// Clean folders used by build
gulp.task('clean', function () {
  return gulp.src(['build', 'tmp'], {read: false}).pipe(clean());
});

// Read all the css files from the css folder and concat into a main.css file
gulp.task('css', ['clean'], function() {
  return gulp.src(['css/**.*'])
    .pipe(concat('main.min.css'))
    .pipe(gulp.dest('build/css'));
});

// This is the data context object used to provide data to the Handlebar templates
var Data = {
};

// Create the index file from the Handlebars template
gulp.task('index', ['clean', 'partials'], function() {
  return gulp
    .src(["contents/index.hbs"], { base: './contents' })
    .pipe(tap(function(file) {
      var template = Handlebars.compile(file.contents.toString())
      var html = template(Data)
      file.contents = new Buffer(html, "utf-8")
    }))
    .pipe(rename(function(path) {
      path.extname = ".html"
    }))
    .pipe(gulp.dest('build'));
});

// Move images
gulp.task('move-images', ['clean'], function() {
  return gulp.src('contents/images/**.*').pipe(gulp.dest('build/images'))
})


// Reads *.hbs files from contents/partials folder and registers them with Handlebars
gulp.task('partials', ['clean'], function() {
  return gulp.src(["contents/partials/**.hbs"])
    .pipe(tap(function(file) {
      var template = file.contents.toString()
      var templateName = Path.basename(file.path).replace(".hbs", "")
      Handlebars.registerPartial(templateName, template)
    }))
});

gulp.task('pages', ['clean', 'partials'], function() {
  return gulp
    .src(["contents/pages/**.hbs"], { base: './contents/pages' })
    .pipe(tap(function(file) {
      var template = Handlebars.compile(file.contents.toString())
      var html = template(Data)
      file.contents = new Buffer(html, "utf-8")
    }))
    .pipe(rename(function(path) {
      path.extname = ".html"
    }))
    .pipe(gulp.dest('build'));
});

gulp.task('watch', function() {
  return gulp.watch(['contents/**/**.*', 'css/**.*'], ['default']);
})

gulp.task('default', ['clean', 'css', 'index', 'pages', 'move-images']);
