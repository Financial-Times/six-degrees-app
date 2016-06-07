import Ajax from '../../models/services/ajax.js';

class PeopleData {

    constructor() {
        this.people = {};
    }

    getMentionedMostly() {
        return Ajax.get({
            url: 'api/mentioned'
            //url: 'app/dev/client/assets/mocks/most-mentioned-people.json'
        });
    }

    getConnections(uuid) {
        return Ajax.post({
            url: 'api/connections',
            headers: {
                'X-UUID': uuid
            },
            data: {
                uuid: uuid
            }
        }).then(response => {
            response.forEach(connection => {
                if (!this.people[connection.person.id]) {
                    this.people[connection.person.id] = connection.person;
                    this.stored.push(connection.person);
                }
            });
            return response;
        });
    }

    storeMentioned(people) {
        this.stored = people;
        people.forEach(person => {
            this.people[person.id] = person;
        });
    }

    setActive(id) {
        this.stored.forEach((person, index) => {

            if (person.id === id) {
                this.activePerson = this.stored[index];

                Ajax.post({
                    url: 'http://test.api.ft.com/content/search/v1?apiKey=wyxefweay4e9vucqkc2fw24s',
                    data: {
                        'queryString': 'people: ' + this.activePerson.prefLabel,
                        'queryContext': {
                            'curations': [
                                'ARTICLES'
                            ]
                        },
                        'resultContext': {
                            'aspects': ['title', 'images', 'location', 'summary'],
                            'facets': {'names': ['people', 'organisations'], 'maxElements': 20, 'minThreshold': 1}
                        }
                    }
                }).then(response => {
                    const results = response.results[0].results;
                    if (results) {
                        this.activePerson.relatedContent = results;
                        this.activePerson.maxContentItems = results.length > 3 ? 3 : results.length;
                    }
                });
            }
        });
    }

}

export default new PeopleData();
