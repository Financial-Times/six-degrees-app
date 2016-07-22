(function () {
    'use strict';

    const CONFIG = require('./config').get(),
        MODULE_CONFIG = {
            CHECKS_TIMEOUT: 10000,
            CHECKS_IN_PROGRESS: false
        },
        request = require('request'),
        moment = require('moment'),
        winston = require('./winston-logger'),
        checks = {},
        requestConfig = {
            'fe-landing-page': {
                url: 'http://six-degrees.ft.com/',
                summary: {
                    name: 'FT UPP Six Degrees landing page',
                    severity: 3,
                    businessImpact: 'The FT UPP Six Degrees not accessible to end users.',
                    technicalSummary: 'Tests if it is possible to load the Front-End SPA.',
                    panicGuide: 'Check the app state at https://dashboard.heroku.com/apps/ft-upp-six-degrees or build state at https://circleci.com/gh/Financial-Times/six-degrees-app'
                }
            },
            'fe-connections-page': {
                url: 'http://six-degrees.ft.com/#/connections/',
                summary: {
                    name: 'FT UPP Six Degrees connections page',
                    severity: 3,
                    businessImpact: 'The FT UPP Six Degrees connections page broken for end users.',
                    technicalSummary: 'Tests if it is possible to load connections page within the Front-End SPA.',
                    panicGuide: 'Check http://six-degrees.ft.com/monitor/ or the console output at http://six-degrees.ft.com/#/connections/'
                }
            },
            'be-search-api-integration': {
                url: 'http://six-degrees.ft.com/api/search/John',
                summary: {
                    name: 'FT UPP Six Degrees internal API - integration with FT Elastic Search API',
                    severity: 3,
                    businessImpact: 'Not possible to find people within the FT UPP Six Degrees Front End App - impacts end users.',
                    technicalSummary: 'Integration test with FT Elastic Search API - sends request and expects a response in correct format.',
                    panicGuide: 'Check http://six-degrees.ft.com/monitor/ or the console output at http://six-degrees.ft.com/#/'
                }
            },
            'be-ft-api-integration': {
                url: 'http://six-degrees.ft.com/api/content/xyz',
                summary: {
                    name: 'FT UPP Six Degrees internal API - integration with FT Content API',
                    severity: 3,
                    businessImpact: 'Not possible to get content data (articles, images) within the FT UPP Six Degrees Front End App - impacts end users.',
                    technicalSummary: 'Integration test with FT Content API - sends request and expects a response in correct format.',
                    panicGuide: 'Check http://six-degrees.ft.com/monitor/ or the console output at http://six-degrees.ft.com/#/connections/'
                }
            },
            'be-membership-api-integration': {
                url: 'http://six-degrees.ft.com/api/uuid/xyz',
                summary: {
                    name: 'FT UPP Six Degrees internal API - integration with FT Membership API',
                    severity: 3,
                    businessImpact: 'Not possible to get session data for current user, hence to personalise content displayed within the FT UPP Six Degrees Front End App - impacts end users.',
                    technicalSummary: 'Integration test with FT Membership API - sends request and expects a response in correct format.',
                    panicGuide: 'Check http://six-degrees.ft.com/monitor/ or the console output at http://six-degrees.ft.com/#/'
                }
            },
            'be-six-degrees-api-integration': {
                url: 'http://six-degrees.ft.com/api/mentioned',
                type: 'post',
                headers: {
                    'x-uuid': 'xyz'
                },
                summary: {
                    name: 'FT UPP Six Degrees internal API - integration with FT Six Degrees API',
                    severity: 3,
                    businessImpact: 'Not possible to get most mentioned people or connections data within the FT UPP Six Degrees Front End App - impacts end users.',
                    technicalSummary: 'Integration test with FT Six Degrees API - sends request and expects a response in correct format.',
                    panicGuide: 'Check http://six-degrees.ft.com/monitor/ or the console output at http://six-degrees.ft.com/#/'
                }
            }
        };

    function getCheckSummary(id, result, output) {
        const summary = requestConfig[id].summary;
        return {
            'id': id,
            'name': summary.name,
            'ok': result,
            'severity': summary.severity,
            'businessImpact': summary.businessImpact,
            'technicalSummary': summary.technicalSummary,
            'panicGuide': summary.panicGuide,
            'checkOutput': output || 'none',
            'lastUpdated': moment()
        };
    }

    function getChecks() {
        let key, result = [];

        for (key in checks) {
            if (checks.hasOwnProperty(key)) {
                result.push(checks[key]);
            }
        }

        if (!result.length) {
            result = moment() + ' not yet performed';
        }

        return result;
    }

    function check(clientRequest, clientResponse) {

        const data = {
                'schemaVersion': 1,
                'systemCode': CONFIG.SYSTEM_CODE,
                'name': CONFIG.APP,
                'description': CONFIG.DESCRIPTION,
                'checks': getChecks()
            },
            headers = [{
                key: 'Cache-control',
                value: 'no-store'
            }, {
                key: 'Content-Type',
                value: 'application/json'
            }, {
                key: 'Content-Length',
                value: Buffer.byteLength(data, 'utf-8')
            }];

        headers.forEach(header => {
            clientResponse.header(header.key, header.value);
        });

        clientResponse.json(data);
    }

    function test(id) {
        request(requestConfig[id], function (error) {
            if (!error) {
                winston.logger.info('[health] ' + 'Service \'' + id + '\' OK');
                checks[id] = getCheckSummary(id, true);
            } else {
                winston.logger.warn('[health] Problem with \'' + id + '\'...\n' + error);
                checks[id] = getCheckSummary(id, true, error);
            }
        });
    }

    (function init() {
        if (!MODULE_CONFIG.CHECKS_IN_PROGRESS) {
            MODULE_CONFIG.CHECKS_IN_PROGRESS = true;
            setInterval(function () {
                test('fe-landing-page');
                test('fe-connections-page');
                test('be-search-api-integration');
                test('be-ft-api-integration');
                test('be-membership-api-integration');
                test('be-six-degrees-api-integration');
            }, MODULE_CONFIG.CHECKS_TIMEOUT);
        }
    }());

    module.exports = {
        check: check
    };

}());
