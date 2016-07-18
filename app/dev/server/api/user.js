(function () {
    'use strict';

    const CONFIG = require('../config').get(),
        request = require('request'),
        responder = require('../api/common/responder'),
        jsonHandler = require('../api/common/json-handler');


    function getSession(sessionId, clientResponse) {
        request({
            url: CONFIG.API_URL.MEMBERSHIP.SESSIONS.PROD + sessionId,
            headers: {
                'X-Api-Key': CONFIG.AUTH.API_KEY.MEMBERSHIP.PROD
            }
        }, function (error, response, body) {
            if (body) {
                responder.send(clientResponse, {
                    status: 200,
                    description: 'session search result',
                    data: jsonHandler.parse(body)
                });
            } else {
                responder.send(clientResponse, {
                    status: 502,
                    error: 'bad gateway'
                });
            }
        });
    }

    module.exports = {
        getSession: getSession
    };

}());
