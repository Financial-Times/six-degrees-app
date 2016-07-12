(function () {
    'use strict';

    const CONFIG = require('../config').get(),
        responder = require('../api/common/responder'),
        preloader = require('../api/common/preloader'),
        cache = require('../api/common/cache'),
        cacheStorage = cache.storage,
        request = require('request'),
        winston = require('../winston-logger'),
        moment = require('moment');

    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'; // Avoids DEPTH_ZERO_SELF_SIGNED_CERT error for self-signed certs

    function validateBasicAuth(auth) {
        return auth.replace('Basic ', '') === CONFIG.AUTH.BASIC_TOKEN;
    }

    function parseJson(body) {
        let bodyParsed = null;
        try {
            bodyParsed = JSON.parse(body);
        } catch (err) {
            winston.logger.error('Response body parser error:\n', err);
        }
        return bodyParsed;
    }

    function handleTestCall(clientResponse) {
        responder.send(clientResponse, {
            status: 200,
            data: {
                result: true
            }
        });
    }

    function getAndCacheConnections(body) {
        const todayDate = moment().format('YYYYMMDD'),
            fromDate = moment().add(-7, 'days').format('YYYY-MM-DD'),
            toDate = moment().format('YYYY-MM-DD'),
            peopleIds = [],
            people = parseJson(body);

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
                request(CONFIG.API_URL.SIX_DEGREES.HOST + 'connectedPeople?minimumConnections=2&fromDate=' + fromDate + '&toDate=' + toDate + '&limit=50&uuid=' + uuid, function (error, response, connectionsBody) {
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

    function handleConnectionsCall(uuid, clientResponse) {
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
                data: parseJson(cacheStorage.connections[todayDate][uuid])
            });

        } else {

            const timeout = setTimeout(function () {
                winston.logger.warn('No answer for 5 secs from most mentioned people service.');
                responder.send(clientResponse, {
                    status: 504,
                    error: 'timeout'
                });
                responseSent = true;
            }, 2000);


            request(CONFIG.API_URL.SIX_DEGREES.HOST + 'connectedPeople?minimumConnections=2&fromDate=' + fromDate + '&toDate=' + toDate + '&limit=50&uuid=' + uuid, function (error, response, body) {
                if (!responseSent && response.statusCode === 200) {
                    cacheStorage.connections[todayDate] = cacheStorage.connections[todayDate] || {};
                    cacheStorage.connections[todayDate][uuid] = body;
                    clearTimeout(timeout);
                    responder.send(clientResponse, {
                        status: 200,
                        description: 'new connections',
                        data: parseJson(body)
                    });
                    getAndCacheConnections(body);
                } else if (!responseSent) {
                    responder.send(clientResponse, {
                        status: 502,
                        error: 'bad gateway'
                    });
                }
            });
        }

    }

    function getPeopleFromHistory(uuid, history, callback) {
        const todayDate = moment().format('YYYYMMDD'),
            annotatedPeople = [],
            articles = history.articles;

        let responseCount = 0,
            responseData = [];

        articles.forEach(article => {
            request(CONFIG.API_URL.ENRICHED_CONTENT + article.id + '?apiKey=' + CONFIG.AUTH.API_KEY.ENRICHED_CONTENT, function (error, response, enrichedcontent) {
                responseCount += 1;
                parseJson(enrichedcontent).annotations.forEach(annotation => {
                    if (annotation.type === 'PERSON') {
                        annotatedPeople.push({
                            id: annotation.id,
                            prefLabel: annotation.prefLabel
                        });
                    }
                });
            });
        });

        setTimeout(() => {
            responseData = {
                all: responseCount === articles.length,
                people: annotatedPeople
            };

            responseData = annotatedPeople;
            cacheStorage.users[todayDate][uuid].response = responseData;
            callback(200, responseData);
        }, 2000);
    }

    function handleUsersPeople(uuid, callback) {
        const todayDate = moment().format('YYYYMMDD');

        cache.handle('users');
        cacheStorage.users[todayDate] = cacheStorage.users[todayDate] || {};
        cacheStorage.users[todayDate][uuid] = cacheStorage.users[todayDate][uuid] || {};

        if (cacheStorage.users[todayDate][uuid].history) {
            winston.logger.info('History cached, serving response from cache.\n' + cacheStorage.users[todayDate][uuid].history);
            getPeopleFromHistory(uuid, cacheStorage.users[todayDate][uuid].history, callback);
        } else {
            winston.logger.info('No history cache detected, sending request for ' + uuid);
            request(CONFIG.API_URL.RECOMMENDATIONS.USERS + uuid + '/history?limit=10&recency=7&apiKey=' + CONFIG.AUTH.API_KEY.RECOMMENDATIONS, function (error, response, history) {
                if (response && response.statusCode === 200) {
                    cacheStorage.users[todayDate][uuid].history = parseJson(history).response;
                    getPeopleFromHistory(uuid, parseJson(history).response, callback);
                } else if (!error && response) {
                    callback(404, JSON.parse(response.body));
                } else {
                    callback(502, error);
                }
            });
        }
    }

    function handleMostMentionedCall(uuid, clientResponse) {
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
                data: parseJson(cacheStorage.people[todayDate])
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
                    error: 'timeout'
                });
                responseSent = true;
            }, 5000);

            if (uuid) {
                clearTimeout(timeout);
                handleUsersPeople(uuid, function (status, data) {
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
                            data: parseJson(body)
                        });
                        getAndCacheConnections(body);
                        responseSent = true;
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

    function handleSearchCall(query, clientResponse) {
        request({
            url: CONFIG.API_URL.ELASTIC_SEARCH.MAIN + 'concepts/people/_search?q=' + query,
            headers: {
                'Authorization': CONFIG.AUTH.HEADERS.ELASTIC_SEARCH.BASIC
            }
        }, function (error, response, body) {
            if (body) {
                responder.send(clientResponse, {
                    status: 200,
                    description: 'people search query results',
                    data: parseJson(body).hits ? parseJson(body).hits.hits : []
                });
            } else {
                responder.send(clientResponse, {
                    status: 502,
                    error: 'bad gateway'
                });
            }
        });
    }

    function handleLookUpCall(uuid, clientResponse) {
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
                    data: parseJson(body)
                });
            } else {
                responder.send(clientResponse, {
                    status: 502,
                    error: 'bad gateway'
                });
            }
        });
    }

    function handleContentCall(id, clientResponse) {
        request({
            url: CONFIG.API_URL.CONTENT + id + '?apiKey=' + CONFIG.AUTH.API_KEY.FT
        }, function (error, response, body) {
            if (body) {
                let parsedBody = {};
                try {
                    parsedBody = parseJson(body);
                } catch (err) {
                    winston.logger.warn('Error during response body parsing!\n' + err + '\nBody:\n' + body);
                }

                if (parsedBody.mainImage && parsedBody.mainImage.id) {
                    const uuid = parsedBody.mainImage.id.replace('http', 'https').replace(process.env.FT_API_URL + 'content/', '');

                    request({
                        url: CONFIG.API_URL.CONTENT + uuid + '?apiKey=' + CONFIG.AUTH.API_KEY.FT
                    }, function (imagesError, imagesResponse, imagesBody) {
                        imagesBody = parseJson(imagesBody);

                        if (imagesBody.members) {
                            const memberUuid = imagesBody.members[0].id.replace('http', 'https').replace(process.env.FT_API_URL + 'content/', '');
                            request({
                                url: CONFIG.API_URL.CONTENT + memberUuid + '?apiKey=' + CONFIG.AUTH.API_KEY.FT
                            }, function (imageError, imageResponse, imageBody) {
                                imageBody = parseJson(imageBody);
                                parsedBody.binaryUrl = imageBody.binaryUrl;

                                preloader.handle(parsedBody, function (data) {
                                    responder.send(clientResponse, {
                                        status: 200,
                                        description: 'image caching result',
                                        data: data
                                    });
                                });
                            });
                        } else {
                            responder.send(clientResponse, {
                                status: 200,
                                description: 'image lookup result',
                                data: parsedBody
                            });
                        }
                    });
                } else {
                    responder.send(clientResponse, {
                        status: 200,
                        description: 'image lookup result',
                        data: parsedBody
                    });
                }
            } else {
                responder.send(clientResponse, {
                    status: 502,
                    error: 'bad gateway'
                });
            }
        });
    }

    function handleUuidCall(sessionId, clientResponse) {
        request({
            url: CONFIG.API_URL.MEMBERSHIP.SESSIONS.PROD + sessionId,
            headers: {
                'X-Api-Key': CONFIG.AUTH.API_KEY.MEMBERSHIP.PROD
            }
        }, function (error, response, body) {
            if (body) {
                responder.send(clientResponse, {
                    status: 200,
                    description: 'uuid search result',
                    data: parseJson(body)
                });
            } else {
                responder.send(clientResponse, {
                    status: 502,
                    error: 'bad gateway'
                });
            }
        });
    }

    function handlePersonImageCall(name, clientResponse) {
        request({
            url: 'https://en.wikipedia.org/w/api.php?action=query&titles=' + name + '&prop=pageimages&format=json&pithumbsize=100'
        }, function (error, response, body) {

            let key, url;
            body = parseJson(body);

            if (body.query && body.query.pages) {
                for (key in body.query.pages) {
                    if (body.query.pages.hasOwnProperty(key)) {
                        url = body.query.pages[key].thumbnail ? body.query.pages[key].thumbnail.source : null;
                    }
                }
            }

            responder.send(clientResponse, {
                status: 200,
                description: 'wikipedia image search result',
                data: {
                    url: url
                }
            });
        });
    }

    function handleLogsCall(params, auth, clientResponse) {

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
                fields: fields
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
                });
            });

        }

    }

    function handleGet(clientRequest, clientResponse) {
        const params = clientRequest.url.replace('/api/', '').split('/');

        if (params.length && params[0] !== '') {

            winston.logger.info('API GET request detected, params: ' + JSON.stringify(clientRequest.query));

            switch (params[0]) {
            case 'test':
                handleTestCall(clientResponse);
                break;
            case 'search':
                handleSearchCall(params[1], clientResponse);
                break;
            case 'lookup':
                handleLookUpCall(params[1], clientResponse);
                break;
            case 'content':
                handleContentCall(params[1], clientResponse);
                break;
            case 'uuid':
                handleUuidCall(params[1], clientResponse);
                break;
            case 'personimage':
                handlePersonImageCall(params[1], clientResponse);
                break;
            case 'logs':
                handleLogsCall(clientRequest.query, clientRequest.headers.authorization, clientResponse);
                break;
            default:
                responder.reject(clientResponse);
                break;
            }

        } else {
            responder.reject(clientResponse);
        }
    }

    function handlePost(clientRequest, clientResponse) {
        const route = clientRequest.url.replace('/api/', ''),
            headers = clientRequest.headers;

        winston.logger.info('API POST request detected. Route: ' + route);

        switch (route) {
        case 'test': (function () {
            return;
        }());
            break;
        case 'mentioned':
            handleMostMentionedCall(headers['x-uuid'], clientResponse);
            break;
        case 'connections':
            handleConnectionsCall(headers['x-uuid'], clientResponse);
            break;
        default: (function () {
            responder.reject(clientResponse);
        }());
            break;
        }

    }

    module.exports = {
        handleGet: handleGet,
        handlePost: handlePost
    };
}());
