var gulp = require('gulp');
var sass = require('gulp-sass');
var imageop = require('gulp-image-optimization');
const imagemin = require('gulp-imagemin');

var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var minifyCSS = require('gulp-minify-css');
var rename = require('gulp-rename');

gulp.task('default', ['sass','imagemin', 'css', 'scripts']);

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

var jsFiles = './public/js/*.js',
    jsDest = './public/js',
    cssFiles = './public/css/*.css;'
    cssDest = './public/css;'

gulp.task('scripts', function() {
    return gulp.src(jsFiles)
        .pipe(concat('scripts.js'))
        .pipe(gulp.dest(jsDest))
        .pipe(rename('scripts.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest(jsDest));
});

gulp.task('css', function(){
    gulp.src(cssFiles)
    	.pipe(concat('style.css'))
    	.pipe(gulp.dest(cssDest))
    	.pipe(rename('style.min.css'))
    	.pipe(minifyCSS())
    	.pipe(gulp.dest(cssDest))
});


