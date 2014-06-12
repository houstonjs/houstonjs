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
var runSequence = require('run-sequence');
var _ = require('underscore');
var livereload = require('gulp-livereload');
var spawn = require('child_process').spawn;

// Clean folders used by build
gulp.task('clean', function () {
  return gulp.src(['build', 'tmp'], {read: false}).pipe(clean());
});

// Read all the css files from the css folder and concat into a main.css file
gulp.task('css', ['clean'], function() {
  return gulp.src(['assets/css/**.*'])
    .pipe(concat('main.min.css'))
    .pipe(gulp.dest('build/assets/css'));
});

// copy assets over
gulp.task('assets', function(){
  return gulp.src(['assets/**/**.*', '!assets/css/**.*'])
    .pipe(gulp.dest('build/assets'));
});

// This is the data context object used to provide data to the Handlebar templates
var Data = {
};

// Reads the markdown files in the contents/news folder
// Adds a record to Data.news so all the templates have access to all the news articles
// Adds html files to the tmp folder so they can be read by 'write-news'
gulp.task('read-news', function () {
  Data.news = [];
  return gulp.src('contents/news/**.md')
      // Read markdown files and add data to Data.news
      .pipe(tap(function(file, t) {
        var contents = file.contents.toString();
        var index = contents.indexOf("---");

        var json = contents.slice(0,index);
        json = JSON.parse(json);
        json.file = file.path.replace(".md", "")
        json.url = "/news/" + file.relative.replace(".md", ".html")
        Data.news.push(json)

        // Remove the metadata from top
        var str = contents.slice(index+3, contents.length)
        file.contents = new Buffer(str, "utf-8")
      }))
      // Turn markdown into HTML
      .pipe(markdown())
      // Add contents to data after we process markdown into html
      .pipe(tap(function(file, t) {
        var news = _.find(Data.news, function(n) {
          return n.file == file.path.replace(".html", "")
        })
        news.contents = file.contents.toString()
      }))
      // Move files to tmp folder
      .pipe(gulp.dest('tmp/news'));
});

// First reads the template for News articles
// Reads the html files for news from the tmp folder and creates the final html file from the Handlebars template
gulp.task('write-news', ['read-news', 'partials'], function() {
  return gulp.src(["contents/news.hbs"])
    .pipe(tap(function(file) {
      var template = Handlebars.compile(file.contents.toString())

      gulp.src(["tmp/news/**.*"])
        .pipe(tap(function(file) {
          var data = {
            contents: file.contents.toString()
          }
          var html = template(data)
          file.contents = new Buffer(html, "utf-8")
        }))
        .pipe(gulp.dest('build/news'));
    }))
});

// Create the index file from the Handlebars template
gulp.task('index', ['partials', 'read-news'], function() {
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

// Reads *.hbs files from contents/partials folder and registers them with Handlebars
gulp.task('partials', ['clean'], function() {
  return gulp.src(["contents/partials/**.hbs"])
    .pipe(tap(function(file) {
      var template = file.contents.toString()
      var templateName = Path.basename(file.path).replace(".hbs", "")
      Handlebars.registerPartial(templateName, template)
    }))
});

gulp.task('watch', function() {
  return gulp.watch(['contents/**/**.*', 'assets/**/**.*'], ['default']);
})

gulp.task('default', ['clean', 'css', 'assets', 'write-news', 'index']);


/**
 * Because I'm a lazy ass panda.
 * 
 * Install livereload Chrome plugin to take full advantage
 * https://chrome.google.com/webstore/detail/livereload/jnihajbhpnppcggbcgedagnkighmdlei?hl=en
 */
gulp.task('nodemon', function(callback) {
  spawn('./node_modules/.bin/nodemon', ['--watch', 'server', '--debug', 'server.js'],{
    stdio: 'inherit'
  }).on('close', function() {
    callback();
  });
});

gulp.task('watch-develop', ['default'], function(){
  var server = livereload();

  gulp.watch('build/**/*.*').on('change', function(file) {
    server.changed(file.path);
  });

  gulp.run('nodemon');

  gulp.watch(['contents/**/**.*', 'assets/**/**.*'], ['default']);
});