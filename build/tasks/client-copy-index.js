(function () {

    const gulp = require('gulp'),
        copy = require('gulp-contrib-copy');

    module.exports = function () {
        return gulp.src(this.opts.config.path.devClient + 'index.html').pipe(copy()).pipe(gulp.dest(this.opts.config.path.buildClient));
    };

    module.exports.dependencies = ['server-copy', 'client-copy-images', 'client-copy-maps', 'client-sass-compressed'];
}());
