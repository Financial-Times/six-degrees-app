(function () {
    'use strict';

    const CONFIG = require('../../config').get(),
        moment = require('moment'),
        responder = require('../common/responder'),
        check = require('../monitor/check'),
        winston = require('../../winston-logger');

    function validateBasicAuth(auth) {
        return auth ? auth.replace('Basic ', '') === CONFIG.AUTH.BASIC_TOKEN : false;
    }

    function getLogs(params, auth, clientResponse) {

        const authValid = validateBasicAuth(auth),
            from = params && params.from ? params.from : moment().add(-1, 'days'),
            until = params && params.until ? params.until : moment();
        let fields;

        if (!authValid) {
            responder.rejectUnauthorized(clientResponse);
        } else {

            if (params) {
                if (params.type && params.type === 'basic') {
                    fields = ['message', 'timestamp', 'level', 'metadata'];
                }
            }

            winston.logger.query({
                from: from,
                until: until,
                start: 0,
                order: 'desc',
                fields: fields,
                limit: 50
            }, function (err, results) {
                let logsQueryStatus,
                    logsData;

                if (err) {
                    logsQueryStatus = err.status;
                    logsData = {};
                } else {
                    logsQueryStatus = 200;
                    logsData = results;
                }

                responder.send(clientResponse, {
                    status: logsQueryStatus,
                    description: 'logs query result',
                    data: logsData
                }, true);
            });

        }

    }

    function handle(params, auth, clientResponse) {
        const authValid = validateBasicAuth(auth);

        if (!authValid) {
            responder.rejectUnauthorized(clientResponse);
        } else {
            check.handle(params, clientResponse);
        }
    }

    module.exports = {
        handle: handle,
        getLogs: getLogs
    };
}());
