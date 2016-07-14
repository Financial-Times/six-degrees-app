(function () {
    'use strict';

    const express = require('express'),
        bodyParser = require('body-parser'),
        fs = require('fs'),
        config = require('./config'),
        CONFIG = config.get(),
        logger = require('./logger'),
        winston = require('./winston-logger'),
        api = require('./api'),
        cors = require('./cors'),
        authS3O = require('s3o-middleware'),
        server = express();

    function updateConfig(version) {
        if (version === 'release') {
            config.set('VER', version);
            config.set('APP_PATH', 'app/' + version + '/client/');
            config.set('MONITOR_PATH', 'app/' + version + '/server/view/monitor/');
            config.set('APP_IMAGES_CACHE_UPLOAD_PATH', 'app/release/client/');
            config.set('APP_IMAGES_CACHE_DOWNLOAD_PATH', '/');

            setTimeout(function () {
                const cacheFolder = 'app/release/client/assets/img/content/';

                if (!fs.existsSync(cacheFolder)) {//eslint-disable-line no-sync
                    fs.mkdirSync(cacheFolder);//eslint-disable-line no-sync
                    fs.mkdirSync(cacheFolder + 'cache/');//eslint-disable-line no-sync
                }
            }, 2000);
        }
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
            winston.logger.info('Running server on port', CONFIG.PORT, 'in', CONFIG.VER, 'version...');
        });

    }

    module.exports = {
        start: start
    };

}());
