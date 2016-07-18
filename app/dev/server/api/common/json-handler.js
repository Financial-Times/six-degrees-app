(function () {
    'use strict';

    const winston = require('../../winston-logger');

    function parse(body) {
        let bodyParsed = null;
        try {
            bodyParsed = JSON.parse(body);
        } catch (err) {
            winston.logger.error('Response body parser error:\n', err);
        }
        return bodyParsed;
    }

    module.exports = {
        parse: parse
    };

}());
