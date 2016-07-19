(function () {
    'use strict';

    const cache = {},
        winston = require('../../winston-logger');

    function add(key, value) {
        cache[key] = value;
    }

    function get(key) {
        return cache[key];
    }

    function updateImageUrl(originalRemoteUrl, newLocalUrl) {
        let key, content;
        for (key in cache) {
            if (cache.hasOwnProperty(key)) {
                content = cache[key];
                content.forEach(article => {
                    if (originalRemoteUrl === article.imageUrl) {
                        winston.logger.info('[content-cache] Replacing ' + article.imageUrl + ' with ' + newLocalUrl);
                        article.imageUrl = newLocalUrl;
                    }
                });
            }
        }
    }

    module.exports = {
        get: get,
        add: add,
        updateImageUrl: updateImageUrl
    };
}());
