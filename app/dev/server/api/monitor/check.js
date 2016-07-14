(function () {
    'use strict';

    const CONFIG = require('../../config').get(),
        request = require('request'),
        responder = require('../common/responder'),
        requestConfig = {
            'people': {
                url: CONFIG.API_URL.PEOPLE + 'xyz?apiKey=' + CONFIG.AUTH.API_KEY.FT
            },
            'content': {
                url: CONFIG.API_URL.CONTENT + 'xyz?apiKey=' + CONFIG.AUTH.API_KEY.FT
            },
            'enriched_content': {
                url: CONFIG.API_URL.ENRICHED_CONTENT + 'xyz?apiKey=' + CONFIG.AUTH.API_KEY.ENRICHED_CONTENT
            },
            'six_degrees': {
                url: CONFIG.API_URL.SIX_DEGREES.HOST + 'mostMentionedPeople'
            },
            'elastic_search': {
                url: CONFIG.API_URL.ELASTIC_SEARCH.MAIN + 'concepts/people/_search?q=John',
                headers: {
                    'Authorization': CONFIG.AUTH.HEADERS.ELASTIC_SEARCH.BASIC
                }
            },
            'sessions': {
                url: CONFIG.API_URL.MEMBERSHIP.SESSIONS.PROD + 'xyz',
                headers: {
                    'X-Api-Key': CONFIG.AUTH.API_KEY.MEMBERSHIP.PROD
                }
            },
            'recommendations': {
                url: CONFIG.API_URL.RECOMMENDATIONS.USERS + 'xyz/history?limit=10&recency=7&apiKey=' + CONFIG.AUTH.API_KEY.RECOMMENDATIONS
            }
        };

    function confirmHealthy(service, response) {
        responder.send(response, {
            status: 200,
            description: 'monitor',
            data: {
                'service': service,
                'healthy': true
            }
        }, true);
    }

    function check(service, response) {
        console.log('[MONITOR] Checking service \'' + service + '\'');
        request(requestConfig[service], function (error) {
            if (!error) {
                console.log('[MONITOR] Service \'' + service + '\' OK');
                confirmHealthy(service, response);
            } else {
                console.log('[MONITOR] Problem with service \'' + service + '\'...', error);
                responder.send(response, {
                    'status': 504,
                    'error': error.code,
                    'type': 'text/plain'
                }, true);
            }
        });
    }

    function handle(service, response) {
        if (requestConfig[service]) {
            check(service, response);
        } else {
            responder.reject(response);
        }
    }

    module.exports = {
        handle: handle
    };

}());
