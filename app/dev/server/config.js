(function () {

    const CONFIG = {
            URL: '127.0.0.1',
            API_URL: {
                CONTENT: process.env.FT_API_URL + 'content/',
                THINGS: process.env.FT_API_URL + 'things/',
                SIX_DEGREES: {
                    HOST: process.env.FT_SIX_DEGREES_API_URL
                },
                ELASTIC_SEARCH: {
                    MAIN: process.env.FT_ELASTIC_SEARCH_API_URL_MAIN,
                    PEOPLE: process.env.FT_ELASTIC_SEARCH_API_URL_PEOPLE
                },
                MEMBERSHIP: {
                    SESSIONS: {
                        PROD: 'https://beta-api.ft.com/sessions/',
                        TEST: 'https://beta-api-t.ft.com/sessions/'
                    }
                }
            },
            AUTH: {
                API_KEY: {
                    FT: process.env.FT_API_KEY,
                    MEMBERSHIP: {
                        PROD: 'kfEpIgvbuo81YH02sD1dI13lk2qGWLMO2xOh9WYL',
                        TEST: 'TeaJIE776S65tdYuFbhTl4qxEGE7Qfoi7UcyrIpm'
                    }
                },
                HEADERS: {
                    ELASTIC_SEARCH: {
                        BASIC: 'Basic ' + process.env.FT_ELASTIC_SEARCH_BASIC_AUTH
                    }
                }
            },
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
            },
            SETTINGS: {
                LOGGER: {
                    LEVEL: 'api'
                }
            }
        },
        cmdArgs = [''];

    process.argv.forEach(function (val, index) {
        if (index > 1 && val) {
            cmdArgs.push(val);
        }
    });

    CONFIG.SETTINGS.LOGGER.LEVEL = (cmdArgs.length && cmdArgs.indexOf('--log-all') > -1) ? 'all' : 'basic';

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

