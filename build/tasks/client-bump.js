(function () {

    const gulp = require('gulp'),
        bump = require('gulp-bump');

    module.exports = function () {
        return gulp.src('./package.json').pipe(bump()).pipe(gulp.dest('./'));
    };

    module.exports.dependencies = ['client-process-html'];

}());
