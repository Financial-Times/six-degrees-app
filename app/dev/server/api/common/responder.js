(function () {
    'use strict';

    const CONFIG = require('../../config').get(),
        winston = require('../../winston-logger'),
        badRequestParams = {
            'status': 400,
            'error': 'Bad request',
            'type': 'text/plain'
        },
        unauthorizedRequestParams = {
            'status': 401,
            'error': 'Unauthorized',
            'type': 'text/plain'
        };

    function send(response, params, nolog) {
        if (response) {
            if (params.status === 200) {
                if (!nolog) {
                    winston.logger.info('Request \'' + (params.description ? params.description + '\' ' : '') + 'successful. Sending JSON response to client.' + (CONFIG.SETTINGS.LOGGER.LEVEL === 'all' ? JSON.stringify(params.data) : ''));
                }
                response.json(params.data);
            } else {
                response.writeHead(params.status, {
                    'Content-Type': 'text/plain'
                });
                if (!nolog) {
                    winston.logger.error((params.description ? 'Request error: \'' + params.description + '\' ' : 'Error') + ', sending text response to client: ' + (params.error || 'unknown'));
                }
                response.end((params.error || 'unknown'));
            }
        }
    }

    function reject(response) {
        send(response, badRequestParams);
    }

    function rejectUnauthorized(response) {
        send(response, unauthorizedRequestParams);
    }

    module.exports = {
        send: send,
        reject: reject,
        rejectUnauthorized: rejectUnauthorized
    };
}());
