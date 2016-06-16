(function () {

    const gulp = require('gulp'),
        eslint = require('gulp-eslint');

    module.exports = function () {
        return gulp.src([
            this.opts.config.path.buildTasks + '**/*.js',
            '!' + this.opts.config.path.devClient + '**/origami-bundle.js',
            '!' + this.opts.config.path.devServer + 'vendor/**/*.js',
            this.opts.config.path.devClient + 'assets/js/src/**/*.js',
            this.opts.config.path.devServer + '**/*.js'
        ]).pipe(eslint({
            useEslintrc: true
        })).pipe(eslint.format()).pipe(eslint.failAfterError());
    };
}());
