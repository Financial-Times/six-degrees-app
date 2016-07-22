(function () {
    'use strict';

    const express = require('express'),
        bodyParser = require('body-parser'),
        fs = require('fs-extra'),
        config = require('./config'),
        CONFIG = config.get(),
        logger = require('./logger'),
        winston = require('./winston-logger'),
        api = require('./api'),
        health = require('./health'),
        cors = require('./cors'),
        authS3O = require('s3o-middleware'),
        server = express();

    function updateConfig(version) {
        if (version === 'dev') {
            config.set('VER', version);
            config.set('APP_PATH', '.');
            config.set('MONITOR_PATH', './app/dev/server/view/monitor/');
            config.set('APP_IMAGES_CACHE_UPLOAD_PATH', 'app/dev/client/');
            config.set('APP_IMAGES_CACHE_DOWNLOAD_PATH', 'app/dev/client/');
        }

        setTimeout(function () {
            const cacheFolder = 'app/' + process.env.APP_VERSION + '/client/assets/img/content/';

            if (fs.existsSync(cacheFolder)) {//eslint-disable-line no-sync
                fs.removeSync(cacheFolder);//eslint-disable-line no-sync
                fs.mkdirs(cacheFolder + 'cache/optimized/');
            } else {
                fs.mkdirs(cacheFolder + 'cache/optimized/');
            }
        }, 2000);
    }

    function initializeServer(version) {
        updateConfig(version);
        server.use(logger);
        server.use(cors);
        server.use(authS3O);
        server.use(bodyParser.urlencoded({
            extended: false
        }));
        server.use('/', express.static(CONFIG.APP_PATH));
        server.use('/monitor/', express.static(CONFIG.MONITOR_PATH));
        server.get('/__health', health.check);
    }

    function start(version) {

        initializeServer(version);

        server.get('/api/*', function (request, response) {
            api.handleGet(request, response);
        });

        server.post('/api/*', function (request, response) {
            api.handlePost(request, response);
        });

        server.listen(CONFIG.PORT, function () {
            winston.logger.info('[boot] Running server on port', CONFIG.PORT, 'in', CONFIG.VER, 'version...');
        });

    }

    module.exports = {
        start: start
    };

}());
