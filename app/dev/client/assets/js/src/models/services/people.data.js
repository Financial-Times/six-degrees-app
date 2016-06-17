import Ajax from '../../models/services/ajax.js';

class PeopleData {

    constructor() {
        this.elasticSearchPerson = null;
        this.people = {};
        this.browsingHistory = [];
    }

    addToContent(response, imageUrl) {
        let contains = false;
        this.activePerson.relatedContentLoading = false;

        function compare(a, b) {
            if (a.publishedTimestamp < b.publishedTimestamp) {
                return 1;
            }
            if (a.publishedTimestamp > b.publishedTimestamp) {
                return -1;
            }
            return 0;
        }

        response.title = response.title.length > 65 ? response.title.substring(0, 65) + '...' : response.title;
        response.byline = response.byline.length > 70 ? response.byline.substring(0, 70) + '...' : response.byline;

        if (this.activePerson.relatedContent) {
            this.activePerson.relatedContent.forEach(article => {
                if (article.title === response.title) {
                    contains = true;
                }
            });
        }

        if (!contains) {
            this.activePerson.relatedContent = this.activePerson.relatedContent || [];
            this.activePerson.relatedContent.push({
                title: response.title,
                imageUrl: imageUrl,
                byline: response.byline,
                published: moment(response.publishedDate).format('MMMM DD, YYYY'),
                publishedTimestamp: moment(response.publishedDate).unix(),
                location: {
                    uri: response.webUrl
                }
            });
        }

        this.activePerson.relatedContent.sort(compare);
        this.activePerson.maxContentItems = this.activePerson.relatedContent.length > 5 ? 6 : this.activePerson.relatedContent.length;
    }

    getContent(contentItems) {
        this.activePerson.relatedContentLoading = true;
        this.activePerson.relatedContent = this.activePerson.relatedContent || [];

        contentItems.forEach(item => {
            Ajax.get({
                url: 'api/content/' + item.id
            }).then(response => {

                if (response.mainImage && response.mainImage.id) {
                    Ajax.get({
                        url: 'api/images/' + response.mainImage.id.replace('http://api.ft.com/content/', '')
                    }).then(imageResponse => {
                        if (imageResponse.members) {
                            Ajax.get({
                                url: 'api/image/' + imageResponse.members[0].id.replace('http://api.ft.com/content/', '')
                            }).then(memberResponse => {
                                this.addToContent(response, memberResponse.binaryUrl.replace('http', 'https'));
                            });
                        }
                    });
                } else {
                    this.addToContent(response);
                }
            });
        });
    }

    getMentionedMostly() {
        return Ajax.get({
            url: 'api/mentioned'
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
            if (response.length) {
                //response contains articles in relation to connected people
                const content = [];
                response.forEach(connectionRelatedArticles => {
                    connectionRelatedArticles.content.forEach(article => {
                        content.push(article);
                    });
                });
                this.getContent(content);
                response.forEach(connection => {
                    if (!this.people[connection.person.id]) {
                        this.people[connection.person.id] = connection.person;
                        this.stored.push(connection.person);
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

    setActive(id) {
        this.stored.forEach((person, index) => {
            if (person.id === id) {
                this.activePerson = this.stored[index];
                this.activePerson.name = this.getAbbreviatedName(this.activePerson.prefLabel);
            }
        });
    }

    setActiveByName(name) {
        this.stored.forEach((person, index) => {
            if (person.prefLabel === name) {
                this.activePerson = this.stored[index];
                this.activePerson.name = this.getAbbreviatedName(this.activePerson.prefLabel);
            }
        });
    }

    acceptedSearchPerson(person) {
        this.elasticSearchPerson = person;
    }

}

export default new PeopleData();
