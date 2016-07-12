(function () {
    'use strict';

    const fs = require('fs'),
        url = require('url'),
        request = require('request'),
        CONFIG = require('../../config').get(),
        winston = require('../../winston-logger'),
        registry = [];

    function fileExists(filePath) {
        try {
            return fs.statSync(filePath).isFile();//eslint-disable-line no-sync
        } catch (err) {
            return false;
        }
    }

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

            if (!err) {
                registry.push(filename);
                request(uri).pipe(fs.createWriteStream(CONFIG.APP_IMAGES_CACHE_UPLOAD_PATH + 'assets/img/content/cache/' + filename + extension)).on('close', callback);
            } else {
                callback(err);
            }

        });
    }

    function handle(imageData, callback) {
        const urlParsed = url.parse(imageData.binaryUrl),
            filename = imageData.binaryUrl.replace(urlParsed.protocol + '//' + urlParsed.host + '/', ''),
            localImageUrl = CONFIG.APP_IMAGES_CACHE_DOWNLOAD_PATH + 'assets/img/content/cache/' + filename + '.jpg';

        if (!fileExists(localImageUrl)) {
            winston.logger.warn('Image not EXISTS.\n' + imageData.binaryUrl + '\n' + localImageUrl);
        }

        if (isRegistered(filename) && fileExists(localImageUrl)) {
            imageData.imageUrl = localImageUrl;
            callback(imageData);
        } else {
            download(imageData.binaryUrl, filename, function (err) {

                if (!err && fileExists(localImageUrl)) {
                    winston.logger.info('Image loaded & cached.\n' + imageData.binaryUrl);
                    imageData.imageUrl = localImageUrl;

                }

                callback(imageData);
            });
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
