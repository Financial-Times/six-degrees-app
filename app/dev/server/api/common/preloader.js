(function () {
    'use strict';

    const fs = require('fs-extra'),
        url = require('url'),
        request = require('request'),
        glob = require('glob'),
        Jimp = require('jimp'),
        CONFIG = require('../../config').get(),
        winston = require('../../winston-logger'),
        localCachePathServer = CONFIG.APP_IMAGES_CACHE_UPLOAD_PATH + 'assets/img/content/cache/',
        localCachePathClient = CONFIG.APP_IMAGES_CACHE_DOWNLOAD_PATH + 'assets/img/content/cache/',
        optimized = [],
        registry = [];

    let imagesOptimizationInProgress = false;

    function optimizeImages() {
        imagesOptimizationInProgress = true;
        setTimeout(function () {
            winston.logger.info('Attempting to optimize content images... ');
            glob(localCachePathServer + '*.*', function (er, images) {

                images.forEach(imagePath => {

                    if (optimized.indexOf(imagePath) === -1) {
                        winston.logger.info('Attempting to optimize image: ' + imagePath);
                        Jimp.read(imagePath).then(function (lenna) {
                            lenna.resize(400, Jimp.AUTO)            // resize
                                .quality(60)                 // set JPEG quality
                                .write(localCachePathServer + 'optimized/' + imagePath.replace(localCachePathServer, ''), function () {
                                    winston.logger.info(imagePath + ' optimized successfuly...');
                                    fs.copy(localCachePathServer + 'optimized/' + imagePath.replace(localCachePathServer, ''), imagePath, function (err) {
                                        let result = true;
                                        if (err) {
                                            winston.logger.info('Copying ' + imagePath + ' to cache failed...', err);
                                            result = err;
                                        } else {
                                            winston.logger.info(imagePath + ' successfully copied to cache...');
                                            optimized.push(imagePath);
                                        }
                                        imagesOptimizationInProgress = false;
                                        return result;
                                    });
                                });
                        }).catch(function (err) {
                            console.error(err);
                        });
                    }
                });

            });

        }, 10000);
    }

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
                request(uri).pipe(fs.createWriteStream(localCachePathServer + filename + extension)).on('close', callback);
            } else {
                callback(err);
            }

        });
    }

    function handle(imageData, callback) {
        if (imageData.binaryUrl) {
            const urlParsed = url.parse(imageData.binaryUrl),
                filename = imageData.binaryUrl.replace(urlParsed.protocol + '//' + urlParsed.host + '/', ''),
                localImageUrl = localCachePathClient + filename + '.jpg',
                localServerImagePath = localCachePathServer + filename + '.jpg';

            if (fileExists(localServerImagePath)) {
                imageData.imageUrl = localImageUrl;
                callback(imageData);
            } else {
                winston.logger.warn('Image not EXISTS.\nremote source: ' + imageData.binaryUrl + '\nlocal target: ' + localServerImagePath);
                download(imageData.binaryUrl, filename, function (err) {
                    if (!err) {
                        winston.logger.info('Image loaded & cached.\nremote source: ' + imageData.binaryUrl + '\nlocal target: ' + localServerImagePath);
                        imageData.imageUrl = localImageUrl;
                        if (!imagesOptimizationInProgress) {
                            optimizeImages();
                        }
                    }

                    callback(imageData);
                });
            }
        } else {
            callback();
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
