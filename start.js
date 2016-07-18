(function () {
    'use strict';

    const fs = require('fs-extra'),
        cmdArgs = [];

    if (fs.existsSync('.env')) {//eslint-disable-line no-sync
        require('dotenv').config();
    }

    process.argv.forEach(function (val, index) {
        if (index > 1 && val) {
            cmdArgs.push(val);
        }
    });

    process.env.APP_VERSION = (cmdArgs.length && cmdArgs.indexOf('--dev') > -1) ? 'dev' : 'release';

    require('./app/' + process.env.APP_VERSION + '/server/boot').start(process.env.APP_VERSION);

}());
