(function () {

    const runSequence = require('run-sequence');

    module.exports = function (callback) {
        return runSequence('client-build-system', 'client-build-html', 'client-copy-origami-bundle', callback);
    };

    module.exports.dependencies = ['clean'];

}());
