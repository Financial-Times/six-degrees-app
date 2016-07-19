(function () {
    'use strict';

    const CONFIG = require('../config').get(),
        request = require('request'),
        Promise = require('promise'),
        responder = require('../api/common/responder'),
        jsonHandler = require('../api/common/json-handler'),
        imagesPreloader = require('../api/common/images-preloader'),
        contentCache = require('../api/common/content-cache');

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
                                    body.imageUrl = body.binaryUrl;
                                    resolve(body);
                                    imagesPreloader.updatePreloadBuffer(body.imageUrl);
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

    function getAll(uuid, content, clientResponse) {
        content = jsonHandler.parse(content);

        const actions = content.map(fetchSingle),
            results = Promise.all(actions);

        results.then(data => {
            responder.send(clientResponse, {
                status: 200,
                data: data,
                description: 'new content'
            });
            contentCache.add(uuid, data);
        }).catch(function () {
            responder.rejectBadGateway();
        });

    }

    module.exports = {
        getAll: getAll
    };
}());
