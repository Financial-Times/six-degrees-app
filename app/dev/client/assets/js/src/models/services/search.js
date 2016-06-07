import Ajax from '../../models/services/ajax.js';

class Search {

    findPerson(params) {
        return Ajax.post({
            url: 'http://test.api.ft.com/content/search/v1?apiKey=wyxefweay4e9vucqkc2fw24s',
            data: {
                'queryString': params.queryString,
                'queryContext': {},
                'resultContext': {
                    'aspects': ['title', 'images', 'location', 'summary'],
                    'facets': {'names': ['people', 'organisations'], 'maxElements': 20, 'minThreshold': 1}
                }
            }
        });
    }

}

export default new Search();
