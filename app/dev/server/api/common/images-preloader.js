(function () {
    'use strict';

    const fs = require('fs-extra'),
        url = require('url'),
        request = require('request'),
        Jimp = require('jimp'),
        CONFIG = require('../../config').get(),
        winston = require('../../winston-logger'),
        contentCache = require('../common/content-cache'),
        localCachePathServer = CONFIG.APP_IMAGES_CACHE_UPLOAD_PATH + 'assets/img/content/cache/',
        localCachePathClient = CONFIG.APP_IMAGES_CACHE_DOWNLOAD_PATH + 'assets/img/content/cache/',
        preloadedImages = [],
        preloadBuffer = [],
        optimizedImages = [],
        optimizeBuffer = [],
        registry = [];

    let preloadingInterval, optimizationInProgress;

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

    function isCached(binaryUrl) {
        const urlParsed = url.parse(binaryUrl),
            id = binaryUrl.replace(urlParsed.protocol + '//' + urlParsed.host + '/', '');

        return isRegistered(id);
    }

    function optimize() {
        if (optimizeBuffer.length > 0) {
            winston.logger.info('[preloader] Images ready for optimization:\n' + JSON.stringify(optimizeBuffer) + '\nhandling...');
            const originalImageUrl = optimizeBuffer[0],
                originalImageUrlParsed = url.parse(originalImageUrl),
                filename = originalImageUrl.replace(originalImageUrlParsed.protocol + '//' + originalImageUrlParsed.host + '/', ''),
                localServerImagePath = localCachePathServer + filename + '.jpg',
                localImageUrl = localCachePathClient + filename + '.jpg';

            if (optimizedImages.indexOf(localImageUrl) === -1 && !optimizationInProgress) {
                optimizationInProgress = true;
                winston.logger.info('Attempting to optimize image: ' + localServerImagePath);

                Jimp.read(localServerImagePath).then(function (image) {
                    image.resize(400, Jimp.AUTO)
                        .quality(60)
                        .write(localCachePathServer + 'optimized/' + localServerImagePath.replace(localCachePathServer, ''), function () {
                            winston.logger.info(localServerImagePath + ' optimized successfuly...');
                            fs.copy(localCachePathServer + 'optimized/' + localServerImagePath.replace(localCachePathServer, ''), localServerImagePath, function (err) {
                                if (err) {
                                    winston.logger.info('Copying ' + localServerImagePath + ' to cache failed, aborting...', err);
                                } else {
                                    winston.logger.info(localServerImagePath + ' successfully copied to cache.');
                                    optimizedImages.push(localServerImagePath);
                                    contentCache.updateImageUrl(originalImageUrl, localServerImagePath);
                                }
                                optimizationInProgress = false;
                            });
                        });
                }).catch(function (err) {
                    console.error(err);
                });
            }

            optimizeBuffer.shift();
        }
    }

    function preload() {
        const imageUrl = preloadBuffer[0],
            imageUrlParsed = url.parse(imageUrl),
            filename = imageUrl.replace(imageUrlParsed.protocol + '//' + imageUrlParsed.host + '/', ''),
            localServerImagePath = localCachePathServer + filename + '.jpg';

        if (fileExists(localServerImagePath)) {
            preloadedImages.push(imageUrl);
            optimizeBuffer.push(imageUrl);
        } else if (filename.indexOf('/') === -1) {
            winston.logger.info('[preloader] Image ' + imageUrl + ' not exists. Downloading...');
            download(imageUrl, filename, function (err) {
                if (!err) {
                    winston.logger.info('[preloader] Image ' + imageUrl + ' downloaded to ' + localServerImagePath);
                    preloadedImages.push(imageUrl);
                    optimizeBuffer.push(imageUrl);
                }
            });
        }

        preloadBuffer.shift();
    }

    function handlePreload() {
        if (preloadBuffer.length > 0) {
            winston.logger.info('[preloader] Images ready for preload:\n' + JSON.stringify(preloadBuffer) + '\nhandling...');
            preload();
            optimize();
        } else {
            clearInterval(preloadingInterval);
            preloadingInterval = null;
            winston.logger.info('[preloader] No images to preload, aborting...');
        }
    }

    function updatePreloadBuffer(imageUrl) {
        if (preloadedImages.indexOf(imageUrl) === -1) {
            winston.logger.info('[preloader] No ' + imageUrl + ' in preload buffer, updating...');
            preloadBuffer.push(imageUrl);
            if (!preloadingInterval) {
                preloadingInterval = setInterval(handlePreload, 10000);
            }
        } else {
            winston.logger.info('[preloader] ' + imageUrl + ' already in preload buffer, aborting...');
        }
    }

    module.exports = {
        isCached: isCached,
        updatePreloadBuffer: updatePreloadBuffer
    };
}());
