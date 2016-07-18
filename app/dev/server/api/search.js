(function () {
    'use strict';

    const CONFIG = require('../config').get(),
        request = require('request'),
        jsonHandler = require('../api/common/json-handler'),
        responder = require('../api/common/responder');


    function find(query, clientResponse) {
        request({
            url: CONFIG.API_URL.ELASTIC_SEARCH.MAIN + 'concepts/people/_search?q=' + query,
            headers: {
                'Authorization': CONFIG.AUTH.HEADERS.ELASTIC_SEARCH.BASIC
            }
        }, function (error, response, body) {
            body = jsonHandler.parse(body);

            if (error) {
                responder.send(clientResponse, {
                    status: 502,
                    error: 'bad gateway'
                });
            } else {
                responder.send(clientResponse, {
                    status: 200,
                    description: 'people search query results',
                    data: body && body.hits ? body.hits.hits : []
                });
            }
        });
    }

    module.exports = {
        find: find
    };
}());
