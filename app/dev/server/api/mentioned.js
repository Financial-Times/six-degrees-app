(function () {
    'use strict';

    const CONFIG = require('../config').get(),
        moment = require('moment'),
        request = require('request'),
        cache = require('../api/common/cache'),
        cacheStorage = cache.storage,
        responder = require('../api/common/responder'),
        jsonHandler = require('../api/common/json-handler'),
        retry = require('../api/common/retry-handler'),
        Connections = require('../api/connections'),
        History = require('../api/history'),
        winston = require('../winston-logger');

    function getUsersPeople(uuid, callback) {
        const todayDate = moment().format('YYYYMMDD');

        cache.handle('users');
        cacheStorage.users[todayDate] = cacheStorage.users[todayDate] || {};
        cacheStorage.users[todayDate][uuid] = cacheStorage.users[todayDate][uuid] || {};

        if (cacheStorage.users[todayDate][uuid].history) {
            winston.logger.info('History cached, serving response from cache.\n' + cacheStorage.users[todayDate][uuid].history);
            History.getPeople(uuid, cacheStorage.users[todayDate][uuid].history, callback);
        } else {
            winston.logger.info('No history cache detected, sending request for ' + uuid);
            request(CONFIG.API_URL.RECOMMENDATIONS.USERS + uuid + '/history?limit=10&recency=7&apiKey=' + CONFIG.AUTH.API_KEY.RECOMMENDATIONS, function (error, response, history) {
                if (response && response.statusCode === 200) {
                    cacheStorage.users[todayDate][uuid].history = jsonHandler.parse(history).response;
                    History.getPeople(uuid, jsonHandler.parse(history).response, callback);
                } else if (!error && response) {
                    callback(404, JSON.parse(response.body));
                } else {
                    callback(502, error);
                }
            });
        }
    }

    function get(uuid, clientResponse) {
        const todayDate = moment().format('YYYYMMDD');
        let responseSent = false;

        cache.handle('people');

        if (!uuid || uuid === 'undefined' || uuid === 'null') {
            uuid = false;
        }

        if (!uuid && cacheStorage.people[todayDate]) {
            winston.logger.info('Serving response from cacheStorage.\n' + cacheStorage.people[todayDate]);
            responder.send(clientResponse, {
                status: 200,
                description: 'cached mentioned people',
                data: jsonHandler.parse(cacheStorage.people[todayDate])
            });
            responseSent = true;
        } else if (uuid && cacheStorage.users[todayDate] && cacheStorage.users[todayDate][uuid] && cacheStorage.users[todayDate][uuid].response) {
            winston.logger.info('Serving response from cacheStorage.\n' + cacheStorage.users[todayDate][uuid].response);
            responder.send(clientResponse, {
                status: 200,
                description: 'cached personalised mentioned people',
                data: cacheStorage.users[todayDate][uuid].response
            });
            responseSent = true;
        } else {

            const timeout = setTimeout(function () {
                winston.logger.warn('No answer for 5 secs: ' + CONFIG.API_URL.SIX_DEGREES.HOST + 'mostMentionedPeople');
                responder.send(clientResponse, {
                    status: 504,
                    description: 'new mentioned people',
                    error: 'timeout'
                });
                responseSent = true;

                if (!retry.inProgress['most-mentioned']) {
                    retry.start('most-mentioned', get, uuid);
                }
            }, 5000);

            if (uuid) {
                clearTimeout(timeout);
                getUsersPeople(uuid, function (status, data) {
                    responder.send(clientResponse, {
                        status: status,
                        data: data
                    });
                });
            } else {
                request(CONFIG.API_URL.SIX_DEGREES.HOST + 'mostMentionedPeople', function (error, response, body) {
                    if (!responseSent && response.statusCode === 200) {
                        cacheStorage.people[todayDate] = body;
                        clearTimeout(timeout);
                        responder.send(clientResponse, {
                            status: 200,
                            description: 'new mentioned people',
                            data: jsonHandler.parse(body)
                        });
                        Connections.getAndCache(body);
                        responseSent = true;
                        retry.stop('most-mentioned');
                    } else if (!responseSent) {
                        responder.send(clientResponse, {
                            status: 502,
                            error: 'bad gateway'
                        });
                        responseSent = true;
                    }
                });
            }
        }

    }

    module.exports = {
        get: get
    };

}());
