var gulp = require('gulp');
var clean = require('gulp-clean');
var watch = require('gulp-watch');
var concat = require('gulp-concat');

gulp.task('clean', function () {
  return gulp.src('build', {read: false}).pipe(clean());
});

gulp.task('css', function() {
  return gulp.src(['css/**.*'])
    .pipe(concat('main.min.css'))
    .pipe(gulp.dest('build/css'));
});

gulp.task('move', ['clean'], function(){
  return gulp.src(["contents/**.*"], { base: './contents' }).pipe(gulp.dest('build'));
});

gulp.task('watch', function() {
  return gulp.watch('contents/**.*', ['move', 'css']);
})

gulp.task('default', ['move', 'css']);
