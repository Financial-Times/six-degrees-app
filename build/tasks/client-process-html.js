(function () {

    const gulp = require('gulp'),
        processhtml = require('gulp-processhtml');

    module.exports = function () {
        return gulp.src(this.opts.config.path.buildClient + 'index.html').pipe(processhtml({})).pipe(gulp.dest(this.opts.config.path.buildClient));
    };

    module.exports.dependencies = ['client-copy-index'];

}());
