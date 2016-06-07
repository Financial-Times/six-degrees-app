(function () {

    const gulp = require('gulp'),
        vinylPaths = require('vinyl-paths'),
        del = require('del'),
        paths = require('./../paths');

    module.exports = function () {
        return gulp.src([paths.exportSrv + '/app']).pipe(vinylPaths(del));
    };

    module.exports.dependencies = ['client-update-release-config'];

}());
