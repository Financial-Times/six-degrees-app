(function () {

    const gulp = require('gulp'),
        sass = require('gulp-sass'),
        sourcemaps = require('gulp-sourcemaps');

    module.exports = function () {
        return gulp.src(this.opts.config.path.devClient + 'assets/sass/style.scss')
            .pipe(sourcemaps.init())
            .pipe(sass().on('error', sass.logError))
            .pipe(sourcemaps.write())
            .pipe(gulp.dest(this.opts.config.path.devClient + 'assets/css'));
    };

}());
