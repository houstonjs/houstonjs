var gulp = require('gulp');
var clean = require('gulp-clean');
var watch = require('gulp-watch');
var concat = require('gulp-concat');
var markdown = require('gulp-markdown');

gulp.task('clean', function () {
  return gulp.src('build', {read: false}).pipe(clean());
});

gulp.task('css', function() {
  return gulp.src(['css/**.*'])
    .pipe(concat('main.min.css'))
    .pipe(gulp.dest('build/css'));
});

gulp.task('news', function () {
    return gulp.src('contents/news/**.md')
        .pipe(markdown())
        .pipe(gulp.dest('build/news'));
});

gulp.task('move', ['clean'], function(){
  return gulp.src(["contents/index.html"], { base: './contents' }).pipe(gulp.dest('build'));
});

gulp.task('watch', function() {
  return gulp.watch('contents/**.*', ['move', 'css']);
})

gulp.task('default', ['move', 'css']);
