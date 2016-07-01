(function () {
    'use strict';

    const fs = require('fs'),
        url = require('url'),
        request = require('request'),
        CONFIG = require('../../config').get(),
        registry = [];

    function isRegistered(id) {
        return registry.indexOf(id) !== -1;
    }

    function determineExtension(type) {
        const extensions = {
            'image/jpeg': '.jpg',
            'image/gif': '.gif',
            'image/png': '.png'
        };
        return extensions[type];
    }

    function download(uri, filename, callback) {

        request.head(uri, function (err, response) {
            const type = response.headers['content-type'],
                extension = determineExtension(type);

            registry.push(filename);
            request(uri).pipe(fs.createWriteStream(CONFIG.APP_IMAGES_CACHE_UPLOAD_PATH + 'assets/img/content/cache/' + filename + extension)).on('close', callback);

        });
    }

    function handle(imageData, callback) {
        const urlParsed = url.parse(imageData.binaryUrl),
            filename = imageData.binaryUrl.replace(urlParsed.protocol + '//' + urlParsed.host + '/', '');

        if (!isRegistered(filename)) {
            download(imageData.binaryUrl, filename, function () {
                console.log('\n[' + CONFIG.APP + '] Image', imageData.binaryUrl, 'loaded.');
                imageData.imageUrl = CONFIG.APP_IMAGES_CACHE_DOWNLOAD_PATH + 'assets/img/content/cache/' + filename + '.jpg';
                callback(imageData);
            });
        } else {
            imageData.imageUrl = CONFIG.APP_IMAGES_CACHE_DOWNLOAD_PATH + 'assets/img/content/cache/' + filename + '.jpg';
            callback(imageData);
        }
    }

    function isCached(binaryUrl) {
        const urlParsed = url.parse(binaryUrl),
            id = binaryUrl.replace(urlParsed.protocol + '//' + urlParsed.host + '/', '');

        return isRegistered(id);
    }

    module.exports = {
        handle: handle,
        isCached: isCached
    };
}());
