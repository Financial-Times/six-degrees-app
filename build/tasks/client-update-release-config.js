(function () {

    const gulp = require('gulp'),
        paths = require('./../paths'),
        replace = require('gulp-replace');


    module.exports = function () {
        return gulp.src([paths.exportSrv + 'config.js']).pipe(replace('app/dev/client/assets/js/dst/*', 'assets/js/*')).pipe(gulp.dest(paths.exportSrv));
    };

    module.exports.dependencies = ['client-export'];

}());
