(function () {

    const bundler = require('aurelia-bundler'),
        bundles = require('./../bundles.js'),
        config = {
            force: true,
            baseURL: '.',
            configPath: './config.js',
            bundles: bundles.bundles
        };

    module.exports = function () {
        return bundler.unbundle(config);
    };

}());
