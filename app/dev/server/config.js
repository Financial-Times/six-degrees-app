(function () {

    const CONFIG = {
        URL: '127.0.0.1',
        PORT: process.env.PORT || 8080,
        APP: 'FTSixDegrees',
        VER: 'dev',
        APP_PATH: '.',
        EXTENSIONS: {
            '.html': 'text/html',
            '.jsp': 'text/html',
            '.js': 'application/javascript',
            '.json': 'application/json',
            '.css': 'text/css',
            '.txt': 'text/plain',
            '.jpg': 'image/jpeg',
            '.gif': 'image/gif',
            '.png': 'image/png',
            '.ico': 'image/ico',
            '.ttf': 'font/ttf',
            '.eot': 'font/eot',
            '.otf': 'font/otf',
            '.woff': 'font/woff',
            '.map': 'application/octet-stream'
        }
    };

    function get() {
        return CONFIG;
    }

    function set(key, value) {
        CONFIG[key] = value;
    }

    module.exports = {
        get: get,
        set: set
    };

}());

