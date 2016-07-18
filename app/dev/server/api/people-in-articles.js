(function () {
    'use strict';

    const CONFIG = require('../config').get(),
        request = require('request'),
        Article = require('../api/article'),
        responder = require('../api/common/responder');

    function fetch(uuid, clientResponse) {

        request(process.env.FT_API_URL + 'content?isAnnotatedBy=' + uuid, {
            headers: {
                'x-api-key': CONFIG.AUTH.API_KEY.FT
            }
        }, function (error, response, content) {
            if (error) {
                responder.rejectBadGateway(response);
            } else {

                if (content && content.length) {
                    Article.getAll(content, clientResponse);
                }
            }
        });

    }

    module.exports = {
        fetch: fetch
    };
}());
