(function () {

    const gulp = require('gulp');

    function reportChange(event) {
        console.log('File ' + event.path + ' was ' + event.type + ', running tasks...');
    }

    function watchJsFiles(opts) {
        gulp.watch([
            opts.config.path.buildTasks + '**/*.js',
            opts.config.path.devServer + '**/*.js',
            opts.config.path.devClient + '**/*.js'
        ], ['client-build-system', 'eslint']).on('change', reportChange);
    }

    function watchSassFiles(opts) {
        gulp.watch([
            opts.config.path.devClient + '**/*.scss'
        ], ['client-sass']).on('change', reportChange);
    }

    function watchHtmlFiles(opts) {
        gulp.watch([
            opts.config.path.devClient + '**/*.html'
        ], ['client-build-html']).on('change', reportChange);
    }

    module.exports = function () {
        return [
            watchHtmlFiles(this.opts),
            watchJsFiles(this.opts),
            watchSassFiles(this.opts)
        ];
    };

    module.exports.dependencies = ['client-unbundle'];

}());
