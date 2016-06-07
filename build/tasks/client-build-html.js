(function () {

    const gulp = require('gulp'),
        changed = require('gulp-changed'),
        paths = require('./../paths');

    module.exports = function () {
        return gulp.src(paths.html)
            .pipe(changed(paths.output, {
                extension: '.html'
            }))
            .pipe(gulp.dest(paths.output));
    };

}());
