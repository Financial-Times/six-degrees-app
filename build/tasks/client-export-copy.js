(function () {
    'use strict';

    const gulp = require('gulp'),
        bundles = require('./../bundles.js'),
        paths = require('./../paths'),
        resources = require('./../export.js');

    module.exports = function () {

        function getBundles() {
            const bl = [];
            let bundle;

            for (bundle in bundles.bundles) {
                if (bundles.bundles.hasOwnProperty(bundle)) {
                    bl.push(bundle + '*.js');
                }
            }

            return bl;
        }

        function getExportList() {
            return resources.list.concat(getBundles());
        }

        return Promise.all([
            gulp.src(getExportList(), {base: '.'}).pipe(gulp.dest(paths.exportSrv)),
            gulp.src([
                'app/dev/client/assets/js/dst/**/*.*'
            ], {
                base: 'app/dev/client/assets/js/dst'
            }).pipe(gulp.dest(paths.exportSrv + 'assets/js/')),
            gulp.src(['app/dev/client/assets/img/**/*.*'], {
                base: 'app/dev/client/assets/img/'
            }).pipe(gulp.dest(paths.exportSrv + 'assets/img/')),
            gulp.src(['app/dev/client/assets/css/**/*.css'], {
                base: 'app/dev/client/assets/css/'
            }).pipe(gulp.dest(paths.exportSrv + 'assets/css/')),

            gulp.src(['app/dev/client/assets/js/vendor/*.*'], {
                base: 'app/dev/client/assets/js/'
            }).pipe(gulp.dest(paths.exportSrv + 'assets/js/'))
        ]);
    };

}());
