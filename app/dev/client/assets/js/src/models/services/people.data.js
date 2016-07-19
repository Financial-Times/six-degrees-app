import Ajax from '../../models/services/ajax.js';
import Content from '../../models/services/content.js';

class PeopleData {

    constructor() {
        this.sourcePerson = null;
        this.elasticSearchPerson = null;
        this.people = {};
        this.browsingHistory = [];
    }

    addToContent(item) {

        let contains = false;

        function compare(a, b) {
            if (a.publishedTimestamp < b.publishedTimestamp) {
                return 1;
            }
            if (a.publishedTimestamp > b.publishedTimestamp) {
                return -1;
            }
            return 0;
        }

        item.title = item.title.length > 65 ? item.title.substring(0, 65) + '...' : item.title;
        item.byline = item.byline.length > 70 ? item.byline.substring(0, 70) + '...' : item.byline;

        this.contentBuffer.images.forEach(article => {
            if (article.title === item.title) {
                contains = true;
            }
        });

        this.contentBuffer.noimages.forEach(article => {
            if (article.title === item.title) {
                contains = true;
            }
        });

        if (!contains) {
            const article = {
                title: item.title,
                imageUrl: item.imageUrl,
                byline: item.byline,
                published: moment(item.publishedDate).format('MMMM DD, YYYY'),
                publishedTimestamp: moment(item.publishedDate).unix(),
                location: {
                    uri: item.webUrl
                }
            };

            if (article.imageUrl) {
                this.contentBuffer.images.unshift(article);
                this.contentBuffer.images.sort(compare);
            } else {
                this.contentBuffer.noimages.push(article);
                this.contentBuffer.noimages.sort(compare);
            }
        } else {
            return;
        }

        Content.update(JSON.parse(JSON.stringify(this.contentBuffer.images.concat(this.contentBuffer.noimages))));
    }

    searchForContent() {
        Content.inProgress = true;
        Ajax.get({
            url: 'api/articles/' + window.encodeURIComponent(this.activePerson.id)
        }).then(response => {
            Content.inProgress = false;
            response.forEach(article => {
                this.addToContent(article);
            });
        }).catch(error => {
            console.warn('error', error);
        });

    }

    getMentionedMostly(uuid) {
        return Ajax.post({
            url: 'api/mentioned',
            headers: {
                'X-UUID': uuid
            }
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
            if (response && response.length) {
                response.forEach(connection => {
                    if (!this.people[connection.person.id]) {
                        this.people[connection.person.id] = connection.person;
                        this.stored.push(connection.person);
                    }
                });
                this.stored.forEach((person) => {
                    if (person.id.replace('http://api.ft.com/things/', '') === uuid) {
                        person.hasConnections = true;
                    }
                });
            }
            return response;
        });
    }

    storeMentioned(people) {
        this.stored = people;
        people.forEach(person => {
            this.people[person.id] = person;
        });
    }

    getAbbreviatedName(prefLabel) {
        const prefLabelArray = prefLabel.split(' '),
            max = prefLabelArray.length;
        return prefLabelArray[0] + ' ' + prefLabelArray[max - 1];
    }

    getImage(name) {
        return Ajax.get({
            url: 'api/personimage/' + name
        });
    }

    updateActivePerson(index) {
        this.activePerson = this.stored[index];
        this.contentBuffer = {
            images: [],
            noimages: []
        };
        if (!this.activePerson.name) {
            this.activePerson.name = this.getAbbreviatedName(this.activePerson.prefLabel);
        }
        if (!this.activePerson.imageUrl) {
            this.getImage(this.activePerson.name).then(image => {
                this.activePerson.imageUrl = image.url;
            });
        }

        if (!this.activePerson.relatedContent) {
            this.searchForContent();
        }
    }

    setActive(id) {
        this.stored.forEach((person, index) => {
            if (person.id === id) {
                this.updateActivePerson(index);
            }
        });
    }

    setActiveByName(name) {
        this.stored.forEach((person, index) => {
            if (person.prefLabel === name) {
                this.updateActivePerson(index);
            }
        });
    }

    setActiveByUuid(uuid) {
        let indexToUpdate = null;

        uuid = uuid.replace('http://api.ft.com/things/', '');
        this.stored = this.stored || [];

        this.stored.forEach((person, index) => {
            if (person.id.replace('http://api.ft.com/things/', '') === uuid) {
                indexToUpdate = index;
            }
        });

        if (indexToUpdate === null) {
            Ajax.get({
                url: '/api/person/' + uuid
            }).then(person => {
                this.stored.push(person);
                this.updateActivePerson(this.stored.length - 1);
            });
        } else {
            this.updateActivePerson(indexToUpdate);
        }

        return uuid;
    }

    acceptedSearchPerson(person) {
        this.elasticSearchPerson = person;
    }

}

export default new PeopleData();
