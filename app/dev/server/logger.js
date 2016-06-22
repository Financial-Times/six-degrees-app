module.exports = function (request, response, next) {

    const config = require('./config'),
        CONFIG = config.get(),
        start = +new Date(),
        stream = process.stdout,
        url = request.url,
        method = request.method;

    response.on('finish', function () {
        const duration = +new Date() - start,
            message = '[' + CONFIG.APP + '] ' + method + ' ' + url + ' [' + duration + ' ms] ' + '\n';

        if (CONFIG.SETTINGS.LOGGER.LEVEL === 'all') {
            stream.write(message);
        }
    });

    next();
};
