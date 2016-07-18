(function () {
    'use strict';

    const responder = require('../api/common/responder'),
        Article = require('../api/article'),
        Connections = require('../api/connections'),
        Mentioned = require('../api/mentioned'),
        Person = require('../api/person'),
        PeopleInArticles = require('../api/people-in-articles'),
        Search = require('../api/search'),
        User = require('../api/user'),
        Monitor = require('../api/monitor'),
        winston = require('../winston-logger');

    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'; // Avoids DEPTH_ZERO_SELF_SIGNED_CERT error for self-signed certs

    function handleGet(clientRequest, clientResponse) {
        const params = clientRequest.url.replace('/api/', '').split('/');

        if (params.length && params[0] !== '') {

            if (params[0] !== 'monitor' && params[0] !== 'logs') {
                winston.logger.info('API GET /' + params[0] + '/' + (clientRequest.query && JSON.stringify(clientRequest.query) !== '{}' ? JSON.stringify(clientRequest.query) : ''));
            }

            switch (params[0]) {
            case 'search':
                Search.find(params[1], clientResponse);
                break;
            case 'lookup':
                Person.lookup(params[1], clientResponse);
                break;
            case 'person':
                Person.get(params[1], clientResponse);
                break;
            case 'personimage':
                Person.getImage(params[1], clientResponse);
                break;
            case 'content':
                Article.get(params[1], clientResponse);
                break;
            case 'uuid':
                User.getSession(params[1], clientResponse);
                break;
            case 'logs':
                Monitor.getLogs(clientRequest.query, clientRequest.headers.authorization, clientResponse);
                break;
            case 'monitor':
                Monitor.handle(params[1], clientRequest.headers.authorization, clientResponse);
                break;
            case 'articles':
                PeopleInArticles.fetch(encodeURIComponent(params[1]), clientResponse);
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
            Mentioned.get(headers['x-uuid'], clientResponse);
            break;
        case 'connections':
            Connections.get(headers['x-uuid'], clientResponse);
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
