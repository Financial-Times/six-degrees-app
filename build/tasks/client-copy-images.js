(function () {

    const gulp = require('gulp'),
        copy = require('gulp-contrib-copy');

    module.exports = function () {
        return gulp.src([this.opts.config.path.devClient + 'assets/img/**/*.*']).pipe(copy()).pipe(gulp.dest(this.opts.config.path.buildClient + '/assets/img/'));
    };
}());
