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

gulp.task('clean', function () {
  return gulp.src('build', {read: false}).pipe(clean());
});

gulp.task('css', function() {
  return gulp.src(['css/**.*'])
    .pipe(concat('main.min.css'))
    .pipe(gulp.dest('build/css'));
});

var Data = {
  test: "Booyah?"
};

var buffer = require('buffer');

gulp.task('news', function () {
  Data.News = [];
  return gulp.src('contents/news/**.md')
      .pipe(tap(function(file, t) {
        var contents = file.contents.toString();
        var index = contents.indexOf("---");
        var json = contents.slice(0,index);
        json = JSON.parse(json);
        json.url = "/news/" + file.relative.replace(".md", ".html")
        Data.News.push(json);

        var str = contents.slice(index+3, contents.length);
        file.contents = new Buffer(str, "utf-8");
      }))
      .pipe(gStreamify(markdown()))
      .pipe(gulp.dest('tmp/news'));
});

gulp.task('index', ['news'], function() {
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

gulp.task('news-html', ['news'], function() {
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
        // .pipe(rename(function(path) {
        //   path.extname = ".html"
        // }))
        .pipe(gulp.dest('build/news'));
    }))
});


gulp.task('move', ['clean'], function(){
  return gulp.src(["contents/index.html"], { base: './contents' }).pipe(gulp.dest('build'));
});

gulp.task('debug', function() {
  return gulp.watch('gulpfile.js', ['news']);
})

gulp.task('watch', function() {
  return gulp.watch('contents/**.*', ['move', 'css']);
})

gulp.task('default', ['move', 'css']);
