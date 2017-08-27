var gulp = require('gulp');
var sass = require('gulp-sass');
var imageop = require('gulp-image-optimization');
const imagemin = require('gulp-imagemin');

gulp.task('default', ['sass','imagemin']);

gulp.task('sass', function () {
  return gulp.src('./sass/*.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest('./public/css'));
});

gulp.task('watch', function () {
  gulp.watch('./sass/*.scss', ['sass']);
});

gulp.task('images', function(cb) {
    gulp.src('./public/img/*').pipe(imageop({
        optimizationLevel: 5,
        progressive: true,
        interlaced: true
    })).pipe(gulp.dest('./public/img')).on('end', cb).on('error', cb);
});

gulp.task('imagemin', () =>
    gulp.src('./public/img/*.jpg')
        .pipe(imagemin())
        .pipe(gulp.dest('./public/img'))
);



