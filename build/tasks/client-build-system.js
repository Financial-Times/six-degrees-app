(function () {

    const gulp = require('gulp'),
        changed = require('gulp-changed'),
        plumber = require('gulp-plumber'),
        babel = require('gulp-babel'),
        sourcemaps = require('gulp-sourcemaps'),
        paths = require('./../paths'),
        compilerOptions = require('./../babel-options'),
        assign = Object.assign || require('object.assign'),
        notify = require('gulp-notify');

    module.exports = function () {
        return gulp.src(paths.source)
            .pipe(plumber({errorHandler: notify.onError('Error: <%= error.message %>')}))
            .pipe(changed(paths.output, {extension: '.js'}))
            .pipe(sourcemaps.init({loadMaps: true}))
            .pipe(babel(assign({}, compilerOptions.system())))
            .pipe(sourcemaps.write({includeContent: false, sourceRoot: '/src'}))
            .pipe(gulp.dest(paths.output));
    };

}());
