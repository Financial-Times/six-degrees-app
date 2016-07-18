(function () {
    'use strict';

    const CONFIG = require('../config').get(),
        request = require('request'),
        responder = require('../api/common/responder'),
        jsonHandler = require('../api/common/json-handler');

    function lookup(uuid, clientResponse) {
        request({
            url: CONFIG.API_URL.ELASTIC_SEARCH.PEOPLE + uuid,
            headers: {
                'Authorization': CONFIG.AUTH.HEADERS.ELASTIC_SEARCH.BASIC
            }
        }, function (error, response, body) {
            if (body) {
                responder.send(clientResponse, {
                    status: 200,
                    description: 'person lookup results',
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

    function getImage(name, clientResponse) {
        request({
            url: 'https://en.wikipedia.org/w/api.php?action=query&titles=' + name + '&prop=pageimages&format=json&pithumbsize=100'
        }, function (error, response, body) {

            let key, url;
            body = jsonHandler.parse(body);

            if (body.query && body.query.pages) {
                for (key in body.query.pages) {
                    if (body.query.pages.hasOwnProperty(key)) {
                        url = body.query.pages[key].thumbnail ? body.query.pages[key].thumbnail.source : null;
                    }
                }
            }

            responder.send(clientResponse, {
                status: 200,
                description: 'wikipedia image search result for ' + decodeURIComponent(name),
                data: {
                    url: url
                }
            });
        });
    }


    function get(uuid, clientResponse) {
        request({
            url: CONFIG.API_URL.PEOPLE + uuid + '?apiKey=' + CONFIG.AUTH.API_KEY.FT
        }, function (error, response, body) {
            responder.send(clientResponse, {
                status: 200,
                description: 'person by uuid',
                data: jsonHandler.parse(body)
            });
        });
    }

    module.exports = {
        get: get,
        getImage: getImage,
        lookup: lookup
    };

}());
