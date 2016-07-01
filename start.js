(function () {
    'use strict';

    const cmdArgs = [];

    require('dotenv').config();

    process.argv.forEach(function (val, index) {
        if (index > 1 && val) {
            cmdArgs.push(val);
        }
    });

    let version = (cmdArgs.length && cmdArgs.indexOf('--dev') > -1) ? 'dev' : 'release';

    require('./app/' + version + '/server/boot').start(version);

}());
