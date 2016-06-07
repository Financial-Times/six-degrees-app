module.exports = function (config) {
    'use strict';
    config.set({

        basePath: '../',

        frameworks: ['mocha', 'chai', 'sinon'],

        files: [
            {pattern: '../app/dev/client/assets/js/test.js', included: true},
            {pattern: 'unit/**/*.spec.js', included: true}
        ],

        reporters: ['progress', 'coverage'],

        coverageReporter: {
            dir: 'coverage-report/unit/',
            reporters: [
                {type: 'html', subdir: 'report-html'}
            ]
        },

        port: 9876,
        colors: true,
        autoWatch: false,
        singleRun: true,

        // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
        logLevel: config.LOG_INFO,

        browsers: ['PhantomJS']

    });
};
