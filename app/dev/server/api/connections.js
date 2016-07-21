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
        winston = require('../winston-logger');

    function getAndCache(body) {
        const todayDate = moment().format('YYYYMMDD'),
            fromDate = moment().add(-7, 'days').format('YYYY-MM-DD'),
            toDate = moment().format('YYYY-MM-DD'),
            peopleIds = [],
            people = jsonHandler.parse(body);

        cache.handle('connections');
        cacheStorage.connections[todayDate] = cacheStorage.connections[todayDate] || {};

        people.forEach(person => {
            if (person.id) {
                peopleIds.push(person.id.replace(CONFIG.API_URL.THINGS, ''));
            } else if (person.person && person.person.id) {
                peopleIds.push(person.person.id.replace(CONFIG.API_URL.THINGS, ''));
            }
        });

        peopleIds.forEach(uuid => {
            if (!cacheStorage.connections[todayDate][uuid]) {
                winston.logger.info('Uuid ' + uuid + ' not found in cacheStorage, sending request...');
                request(CONFIG.API_URL.SIX_DEGREES.HOST + 'connectedPeople?minimumConnections=2&fromDate=' + fromDate + '&toDate=' + toDate + '&limit=50&contentLimit=20&uuid=' + uuid, function (error, response, connectionsBody) {
                    if (response && response.statusCode && response.statusCode === 200) {
                        cacheStorage.connections[todayDate][uuid] = connectionsBody;
                        winston.logger.info('Connections for ' + uuid + 'cached successfuly.');
                    } else {
                        winston.logger.warn('Problem with connections call for ' + uuid + ', aborting...');
                    }

                    if (error) {
                        winston.logger.error('Problem [' + error.code + '] with connections call for ' + uuid + ', aborting...');
                    }
                });
            }
        });
    }

    function get(uuid, clientResponse) {
        let responseSent = false;

        const todayDate = moment().format('YYYYMMDD'),
            fromDate = moment().add(-7, 'days').format('YYYY-MM-DD'),
            toDate = moment().format('YYYY-MM-DD');

        cache.handle('connections');

        if (cacheStorage.connections[todayDate] && cacheStorage.connections[todayDate][uuid]) {

            winston.logger.info('Serving response from cacheStorage.\n' + cacheStorage.connections[todayDate][uuid]);
            responder.send(clientResponse, {
                status: 200,
                description: 'cached connections',
                data: jsonHandler.parse(cacheStorage.connections[todayDate][uuid])
            });

        } else {

            const timeout = setTimeout(function () {
                winston.logger.warn('No answer for 5 secs from connections service for ' + uuid);
                responder.send(clientResponse, {
                    status: 504,
                    description: 'new connections',
                    error: 'timeout'
                });
                responseSent = true;
                if (!retry.inProgress['connections-' + uuid]) {
                    retry.start('connections-' + uuid, get, uuid);
                }
            }, 2000);


            request(CONFIG.API_URL.SIX_DEGREES.HOST + 'connectedPeople?minimumConnections=2&fromDate=' + fromDate + '&toDate=' + toDate + '&limit=50&contentLimit=20&uuid=' + uuid, function (error, response, body) {
                if (!responseSent && response.statusCode === 200) {
                    cacheStorage.connections[todayDate] = cacheStorage.connections[todayDate] || {};
                    cacheStorage.connections[todayDate][uuid] = body;
                    clearTimeout(timeout);
                    responder.send(clientResponse, {
                        status: 200,
                        description: 'new connections',
                        data: jsonHandler.parse(body)
                    });
                    getAndCache(body);
                    retry.stop('connections-' + uuid);
                } else if (!responseSent) {
                    responder.send(clientResponse, {
                        status: 502,
                        error: 'bad gateway'
                    });
                }
            });
        }

    }

    module.exports = {
        get: get,
        getAndCache: getAndCache
    };

}());
