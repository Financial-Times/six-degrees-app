(function () {
    'use strict';

    let CONFIG_INSTANCE;

    const CONFIG = {
            URL: '127.0.0.1',
            API_URL: {
                CONTENT: process.env.FT_API_URL + 'content/',
                PEOPLE: process.env.FT_API_URL + 'people/',
                ENRICHED_CONTENT: process.env.FT_API_URL + 'enrichedcontent/',
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
                        PROD: process.env.FT_SESSIONS_API_URL
                    }
                },
                RECOMMENDATIONS: {
                    USERS: process.env.FT_RECOMMENDATIONS_USERS_API_URL
                }
            },
            AUTH: {
                BASIC_TOKEN: process.env.FT_APP_BASIC_AUTH_TOKEN,
                API_KEY: {
                    FT: process.env.FT_API_KEY,
                    RECOMMENDATIONS: process.env.FT_RECOMMENDATIONS_API_KEY,
                    ENRICHED_CONTENT: process.env.FT_ENRICHED_CONTENT_API_KEY,
                    MEMBERSHIP: {
                        PROD: process.env.FT_SESSIONS_API_KEY
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
            VER: 'release',
            APP_PATH: 'app/release/client/',
            MONITOR_PATH: 'app/release/server/view/monitor/',
            APP_IMAGES_CACHE_UPLOAD_PATH: 'app/release/client/',
            APP_IMAGES_CACHE_DOWNLOAD_PATH: '/',
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
                },
                RETRY: {
                    MAX_ATTEMPTS: 20
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
        if (CONFIG_INSTANCE === undefined) {
            CONFIG_INSTANCE = CONFIG;
        }
        return CONFIG_INSTANCE;
    }

    function set(key, value) {
        if (CONFIG_INSTANCE === undefined) {
            CONFIG[key] = value;
        } else {
            CONFIG_INSTANCE[key] = value;
        }
    }

    module.exports = {
        get: get,
        set: set
    };

}());

