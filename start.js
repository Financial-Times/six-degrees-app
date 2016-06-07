(function () {
    'use strict';

    let version,
        cmdArgs = [];

    process.argv.forEach(function (val, index) {
        if (index > 1 && val) {
            cmdArgs.push(val);
        }
    });

    version = (cmdArgs.length && cmdArgs.indexOf('--dev') > -1) ? 'dev' : 'release';

    require('./app/' + version + '/server/boot').start(version);

}());