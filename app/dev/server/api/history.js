(function () {
    'use strict';

    const CONFIG = require('../config').get(),
        moment = require('moment'),
        request = require('request'),
        cache = require('../api/common/cache'),
        cacheStorage = cache.storage,
        jsonHandler = require('../api/common/json-handler');

    function getPeople(uuid, history, callback) {
        const todayDate = moment().format('YYYYMMDD'),
            annotatedPeople = [],
            articles = history.articles;

        let responseCount = 0,
            responseData = [];

        articles.forEach(article => {
            request(CONFIG.API_URL.ENRICHED_CONTENT + article.id + '?apiKey=' + CONFIG.AUTH.API_KEY.ENRICHED_CONTENT, function (error, response, enrichedcontent) {
                responseCount += 1;
                jsonHandler.parse(enrichedcontent).annotations.forEach(annotation => {
                    if (annotation.type === 'PERSON') {
                        let alreadyInAnnotatedArray = false;

                        annotatedPeople.forEach(annotatedPerson => {
                            if (annotatedPerson.id === annotation.id) {
                                alreadyInAnnotatedArray = true;
                            }
                        });

                        if (!alreadyInAnnotatedArray) {
                            annotatedPeople.push({
                                id: annotation.id,
                                prefLabel: annotation.prefLabel
                            });
                        }
                    }
                });
            });
        });

        setTimeout(() => {
            responseData = {
                all: responseCount === articles.length,
                people: annotatedPeople
            };

            responseData = annotatedPeople;
            cacheStorage.users[todayDate][uuid].response = responseData;
            callback(200, responseData);
        }, 2000);
    }

    module.exports = {
        getPeople: getPeople
    };

}());
