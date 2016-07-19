(function () {
    'use strict';

    const CONFIG = require('../config').get(),
        request = require('request'),
        Article = require('../api/article'),
        responder = require('../api/common/responder'),
        contentCache = require('../api/common/content-cache'),
        winston = require('../winston-logger');

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
                    const contentFromCache = contentCache.get(uuid);
                    if (contentFromCache) {
                        responder.send(clientResponse, {
                            status: 200,
                            data: contentFromCache,
                            description: 'content from cache'
                        });
                    } else {
                        winston.logger.info('[people-in-articles] Content for ' + decodeURIComponent(uuid) + ' not cached, attempting to fetch...');
                        Article.getAll(uuid, content, clientResponse);
                    }
                }
            }
        });

    }

    module.exports = {
        fetch: fetch
    };
}());
