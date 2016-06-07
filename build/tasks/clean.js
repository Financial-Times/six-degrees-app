(function () {

    const gulp = require('gulp'),
        paths = require('../paths'),
        del = require('del'),
        vinylPaths = require('vinyl-paths');

    module.exports = function () {
        return gulp.src([paths.output]).pipe(vinylPaths(del));
    };
    module.exports.dependencies = ['client-unbundle'];

}());
