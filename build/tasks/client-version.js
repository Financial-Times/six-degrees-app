(function () {

    const gulp = require('gulp'),
        version = require('gulp-version-append');

    module.exports = function () {
        return gulp.src(this.opts.config.path.buildClient + 'index.html')
            .pipe(version(['html', 'css', 'js']))
            .pipe(gulp.dest(this.opts.config.path.buildClient));
    };

    module.exports.dependencies = ['client-bump'];

}());
