(function () {
    'use strict';

    const CONFIG = require('../../config').get(),
        badRequestParams = {
            'status': 400,
            'type': 'text/plain'
        };

    function send(response, params) {
        if (params.status === 200) {
            console.log('[' + CONFIG.APP + '] Sending JSON response to client.');
            response.json(params.data);
        } else {
            response.writeHead(params.status, {
                'Content-Type': 'text/plain'
            });
            console.log('[' + CONFIG.APP + '] Sending text response to client.');
            response.end(params.error);
        }
        console.log('[' + CONFIG.APP + '] Client response ended.');
    }

    function reject(response) {
        send(response, badRequestParams);
    }

    module.exports = {
        send: send,
        reject: reject
    };
}());
