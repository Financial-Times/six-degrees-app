(function () {

    const runSequence = require('run-sequence');

    module.exports = function (callback) {
        return runSequence(
            'client-bundle',
            'client-prepare-export',
            'client-export-copy',
            'client-process-html',
            'client-version',
            callback
        );
    };

}());
