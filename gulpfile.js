var gulp = require('gulp');
var clean = require('gulp-clean');
var watch = require('gulp-watch');

gulp.task('clean', function () {
  return gulp.src('build', {read: false}).pipe(clean());
});

gulp.task('move', ['clean'], function(){
  return gulp.src(["contents/**.*"], { base: './contents' }).pipe(gulp.dest('build'));
});

gulp.task('watch', function() {
  return gulp.watch('contents/**.*', ['move']);
})

gulp.task('default', ['move']);
