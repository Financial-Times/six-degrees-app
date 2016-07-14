(function () {
    'use strict';

    const CONFIG = require('../../config').get(),
        winston = require('../../winston-logger'),
        maxNumberOfAttempts = CONFIG.SETTINGS.RETRY.MAX_ATTEMPTS,
        counter = {},
        timeouts = {},
        inProgress = {};

    function stop(name) {
        if (timeouts[name]) {
            clearTimeout(timeouts[name]);
        }
        delete timeouts[name];
        delete counter[name];
        delete inProgress[name];
        winston.logger.info('Request [' + name + '] retry attempts stopped.');
    }

    function start(name, fn, param) {
        if (!counter[name]) {
            counter[name] = 1;
        }

        if (counter[name] < maxNumberOfAttempts) {
            inProgress[name] = true;
            timeouts[name] = setTimeout(function () {
                if (counter[name]) {
                    fn(param);
                    winston.logger.info('Request [' + name + '] retry attempt ' + counter[name]);
                    counter[name] += 1;
                    clearTimeout(timeouts[name]);
                    delete inProgress[name];
                }
            }, 1000 * counter[name]);
        } else {
            winston.logger.info('Request [' + name + '] maximum number of attempts (' + maxNumberOfAttempts + ') reached.');
            stop(name);
        }
    }

    module.exports = {
        start: start,
        stop: stop,
        inProgress: inProgress
    };

}());
