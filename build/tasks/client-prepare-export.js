(function () {

    const gulp = require('gulp'),
        del = require('del'),
        vinylPaths = require('vinyl-paths'),
        paths = require('./../paths');

    module.exports = function () {
        return gulp.src([paths.exportSrv]).pipe(vinylPaths(del));
    };

}());
