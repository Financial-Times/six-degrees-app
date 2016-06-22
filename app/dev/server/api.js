(function () {
    'use strict';

    const CONFIG = require('./config').get(),
        request = require('request'),
        moment = require('moment'),
        responsesCache = {
            people: {},
            connections: {}
        },
        badRequestParams = {
            'status': 400,
            'type': 'text/plain'
        };

    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'; // Avoids DEPTH_ZERO_SELF_SIGNED_CERT error for self-signed certs

    function handleCache(id) {
        if (!responsesCache[id].start) {
            responsesCache[id].start = moment();
        } else {
            if (moment().isAfter(responsesCache[id].start, 'day')) {
                responsesCache[id] = {};
            }
        }
    }

    function sendResponseToClient(response, params) {
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

    function badRequestHandler(clientResponse) {
        sendResponseToClient(clientResponse, badRequestParams);
    }

    function handleTestCall(clientResponse) {
        sendResponseToClient(clientResponse, {
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
            people = JSON.parse(body);

        handleCache('connections');
        responsesCache.connections[todayDate] = responsesCache.connections[todayDate] || {};

        people.forEach(person => {
            if (person.id) {
                peopleIds.push(person.id.replace('http://api.ft.com/things/', ''));
            } else if (person.person && person.person.id) {
                peopleIds.push(person.person.id.replace('http://api.ft.com/things/', ''));
            }
        });

        peopleIds.forEach(uuid => {
            if (!responsesCache.connections[todayDate][uuid]) {
                console.log('[' + CONFIG.APP + ']', uuid, 'not found in cache, sending request...');
                request(CONFIG.API_URL.SIX_DEGREES.HOST + 'connectedPeople?minimumConnections=2&fromDate=' + fromDate + '&toDate=' + toDate + '&limit=50&uuid=' + uuid, function (error, response, connectionsBody) {
                    if (response && response.statusCode && response.statusCode === 200) {
                        responsesCache.connections[todayDate][uuid] = connectionsBody;
                        console.log('[' + CONFIG.APP + '] Connections for', uuid, 'cached successfuly.');
                    } else {
                        console.log('[' + CONFIG.APP + '] Problem with connections call for', uuid + ', aborting...');
                    }

                    if (error) {
                        console.log('[' + CONFIG.APP + '] Problem [' + error.code + '] with connections call for', uuid + ', aborting...');
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

        handleCache('connections');

        if (responsesCache.connections[todayDate] && responsesCache.connections[todayDate][uuid]) {

            console.log('[' + CONFIG.APP + '] Serving response from cache.');
            sendResponseToClient(clientResponse, {
                status: 200,
                data: JSON.parse(responsesCache.connections[todayDate][uuid])
            });

        } else {

            const timeout = setTimeout(function () {
                console.log('[' + CONFIG.APP + '] No answer for 5 secs: https://sixdegrees-demo.in.ft.com/sixdegrees/mostMentionedPeople');
                sendResponseToClient(clientResponse, {
                    status: 504
                });
                responseSent = true;
            }, 2000);


            request(CONFIG.API_URL.SIX_DEGREES.HOST + 'connectedPeople?minimumConnections=2&fromDate=' + fromDate + '&toDate=' + toDate + '&limit=50&uuid=' + uuid, function (error, response, body) {
                if (!responseSent && response.statusCode === 200) {
                    responsesCache.connections[todayDate] = responsesCache.connections[todayDate] || {};
                    responsesCache.connections[todayDate][uuid] = body;
                    clearTimeout(timeout);
                    sendResponseToClient(clientResponse, {
                        status: 200,
                        data: JSON.parse(body)
                    });
                    getAndCacheConnections(body);
                } else if (!responseSent) {
                    sendResponseToClient(clientResponse, {
                        status: 502
                    });
                }
            });
        }

    }

    function handleMostMentionedCall(clientResponse) {
        const todayDate = moment().format('YYYYMMDD');
        let responseSent = false;

        handleCache('people');

        if (responsesCache.people[todayDate]) {
            console.log('[' + CONFIG.APP + '] Serving response from cache.');
            sendResponseToClient(clientResponse, {
                status: 200,
                data: JSON.parse(responsesCache.people[todayDate])
            });
        } else {

            const timeout = setTimeout(function () {
                console.log('[' + CONFIG.APP + '] No answer for 5 secs:', CONFIG.API_URL.SIX_DEGREES.HOST + 'mostMentionedPeople');
                sendResponseToClient(clientResponse, {
                    status: 504
                });
                responseSent = true;
            }, 5000);

            request(CONFIG.API_URL.SIX_DEGREES.HOST + 'mostMentionedPeople', function (error, response, body) {
                if (!responseSent && response.statusCode === 200) {
                    responsesCache.people[todayDate] = body;
                    clearTimeout(timeout);
                    sendResponseToClient(clientResponse, {
                        status: 200,
                        data: JSON.parse(body)
                    });
                    getAndCacheConnections(body);
                } else if (!responseSent) {
                    sendResponseToClient(clientResponse, {
                        status: 502
                    });
                }
            });
        }

    }

    function handleSearchCall(query, clientResponse) {
        request({
            url: CONFIG.API_URL.ELASTIC_SEARCH + 'concepts/people/_search?q=' + query,
            headers: {
                'Authorization': CONFIG.AUTH.HEADERS.ELASTIC_SEARCH.BASIC
            }
        }, function (error, response, body) {
            if (body) {
                sendResponseToClient(clientResponse, {
                    status: 200,
                    data: JSON.parse(body).hits ? JSON.parse(body).hits.hits : []
                });
            } else {
                sendResponseToClient(clientResponse, {
                    status: 502
                });
            }
        });
    }

    function handleLookUpCall(uuid, clientResponse) {
        request({
            url: 'https://pre-prod-up.ft.com/__restorage-elasticsearch-concepts/people/' + uuid,
            headers: {
                'Authorization': CONFIG.AUTH.HEADERS.ELASTIC_SEARCH.BASIC
            }
        }, function (error, response, body) {
            if (body) {
                sendResponseToClient(clientResponse, {
                    status: 200,
                    data: JSON.parse(body)
                });
            } else {
                sendResponseToClient(clientResponse, {
                    status: 502
                });
            }
        });
    }

    function handleContentCall(id, clientResponse) {
        request({
            url: 'https://api.ft.com/content/' + id + '?apiKey=' + CONFIG.AUTH.API_KEY.FT
        }, function (error, response, body) {
            if (body) {
                sendResponseToClient(clientResponse, {
                    status: 200,
                    data: JSON.parse(body)
                });
            } else {
                sendResponseToClient(clientResponse, {
                    status: 502
                });
            }
        });
    }

    function handleImagesCall(id, clientResponse) {
        request({
            url: 'http://api.ft.com/content/' + id + '?apiKey=' + CONFIG.AUTH.API_KEY.FT
        }, function (error, response, body) {
            if (body) {
                sendResponseToClient(clientResponse, {
                    status: 200,
                    data: JSON.parse(body)
                });
            } else {
                sendResponseToClient(clientResponse, {
                    status: 502
                });
            }
        });
    }

    function handleImageCall(id, clientResponse) {
        request({
            url: 'http://api.ft.com/content/' + id + '?apiKey=' + CONFIG.AUTH.API_KEY.FT
        }, function (error, response, body) {
            if (body) {
                sendResponseToClient(clientResponse, {
                    status: 200,
                    data: JSON.parse(body)
                });
            } else {
                sendResponseToClient(clientResponse, {
                    status: 502
                });
            }
        });
    }

    function handleGet(clientRequest, clientResponse) {
        const params = clientRequest.url.replace('/api/', '').split('/');

        if (params.length && params[0] !== '') {
            console.log('[' + CONFIG.APP + '] Parsing URL -> params', params);

            switch (params[0]) {
            case 'test':
                handleTestCall(clientResponse);
                break;
            case 'mentioned':
                handleMostMentionedCall(clientResponse);
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
            case 'images':
                handleImagesCall(params[1], clientResponse);
                break;
            case 'image':
                handleImageCall(params[1], clientResponse);
                break;
            default:
                badRequestHandler(clientResponse);
                break;
            }

        } else {
            badRequestHandler(clientResponse);
        }
    }

    function handlePost(clientRequest, clientResponse) {
        const route = clientRequest.url.replace('/api/', ''),
            headers = clientRequest.headers;

        switch (route) {
        case 'test': (function () {
            return;
        }());
            break;
        case 'connections':
            handleConnectionsCall(headers['x-uuid'], clientResponse);
            break;
        default: (function () {
            badRequestHandler(clientResponse);
        }());
            break;
        }

    }

    exports.handleGet = handleGet;
    exports.handlePost = handlePost;
}());
