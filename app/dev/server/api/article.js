(function () {
    'use strict';

    const CONFIG = require('../config').get(),
        request = require('request'),
        Promise = require('promise'),
        responder = require('../api/common/responder'),
        jsonHandler = require('../api/common/json-handler'),
        preloader = require('../api/common/preloader'),
        winston = require('../winston-logger');

    function fetchSingle(item) {
        return new Promise(function (resolve, reject) {
            request(CONFIG.API_URL.CONTENT + item.id.replace('http://www.ft.com/things/', '') + '?apiKey=' + CONFIG.AUTH.API_KEY.FT, function (err, res) {
                if (err) {
                    reject(err);
                } else {
                    const body = jsonHandler.parse(res.body);
                    if (body && body.mainImage && body.mainImage.id) {
                        const uuid = body.mainImage.id.replace('http', 'https').replace(process.env.FT_API_URL + 'content/', '');

                        request({
                            url: CONFIG.API_URL.CONTENT + uuid + '?apiKey=' + CONFIG.AUTH.API_KEY.FT
                        }, function (imagesError, imagesResponse, imagesBody) {
                            imagesBody = jsonHandler.parse(imagesBody);
                            if (imagesBody.members) {
                                const memberUuid = imagesBody.members[0].id.replace('http', 'https').replace(process.env.FT_API_URL + 'content/', '');
                                request({
                                    url: CONFIG.API_URL.CONTENT + memberUuid + '?apiKey=' + CONFIG.AUTH.API_KEY.FT
                                }, function (imageError, imageResponse, imageBody) {
                                    imageBody = jsonHandler.parse(imageBody);
                                    body.binaryUrl = imageBody.binaryUrl;

                                    preloader.handle(body, function (data) {
                                        resolve(data);
                                    });
                                });
                            } else {
                                resolve(body);
                            }
                        });
                    } else {
                        resolve(body);
                    }
                }
            });
        });
    }

    function getAll(content, clientResponse) {
        content = jsonHandler.parse(content);

        const actions = content.map(fetchSingle),
            results = Promise.all(actions);

        results.then(data => {
            responder.send(clientResponse, {
                status: 200,
                data: data
            });
        }).catch(function () {
            responder.rejectBadGateway();
        });

    }

    function get(id, clientResponse) {
        request({
            url: CONFIG.API_URL.CONTENT + id + '?apiKey=' + CONFIG.AUTH.API_KEY.FT
        }, function (error, response, body) {
            if (body) {
                let parsedBody = {};
                try {
                    parsedBody = jsonHandler.parse(body);
                } catch (err) {
                    winston.logger.warn('Error during response body parsing!\n' + err + '\nBody:\n' + body);
                }

                if (parsedBody && parsedBody.mainImage && parsedBody.mainImage.id) {
                    const uuid = parsedBody.mainImage.id.replace('http', 'https').replace(process.env.FT_API_URL + 'content/', '');

                    request({
                        url: CONFIG.API_URL.CONTENT + uuid + '?apiKey=' + CONFIG.AUTH.API_KEY.FT
                    }, function (imagesError, imagesResponse, imagesBody) {
                        imagesBody = jsonHandler.parse(imagesBody);

                        if (imagesBody.members) {
                            const memberUuid = imagesBody.members[0].id.replace('http', 'https').replace(process.env.FT_API_URL + 'content/', '');
                            request({
                                url: CONFIG.API_URL.CONTENT + memberUuid + '?apiKey=' + CONFIG.AUTH.API_KEY.FT
                            }, function (imageError, imageResponse, imageBody) {
                                imageBody = jsonHandler.parse(imageBody);
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

    module.exports = {
        get: get,
        getAll: getAll
    };
}());
