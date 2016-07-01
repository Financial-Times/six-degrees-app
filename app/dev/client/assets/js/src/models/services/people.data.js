import Ajax from '../../models/services/ajax.js';

class PeopleData {

    constructor() {
        this.sourcePerson = null;
        this.elasticSearchPerson = null;
        this.people = {};
        this.browsingHistory = [];
    }

    addToContent(response, imageUrl) {

        let contains = false;

        this.activePerson.relatedContent = this.activePerson.relatedContent || [];
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

        this.activePerson.contentBuffer.images.forEach(article => {
            if (article.title === response.title) {
                contains = true;
            }
        });

        this.activePerson.contentBuffer.noimages.forEach(article => {
            if (article.title === response.title) {
                contains = true;
            }
        });

        if (!contains) {
            const article = {
                title: response.title,
                imageUrl: imageUrl,
                byline: response.byline,
                published: moment(response.publishedDate).format('MMMM DD, YYYY'),
                publishedTimestamp: moment(response.publishedDate).unix(),
                location: {
                    uri: response.webUrl
                }
            };

            if (article.imageUrl) {
                this.activePerson.contentBuffer.images.unshift(article);
                this.activePerson.contentBuffer.images.sort(compare);
            } else {
                this.activePerson.contentBuffer.noimages.push(article);
                this.activePerson.contentBuffer.noimages.sort(compare);
            }
        } else {
            return;
        }

        this.activePerson.relatedContent = JSON.parse(JSON.stringify(this.activePerson.contentBuffer.images.concat(this.activePerson.contentBuffer.noimages)));

        //this.activePerson.relatedContent.sort(compare);
        //this.activePerson.maxContentItems = this.activePerson.relatedContent.length > 5 ? 6 : this.activePerson.relatedContent.length;
        this.activePerson.maxContentItems = this.activePerson.relatedContent.length;
    }

    getContent(contentItems) {
        if (!this.activePerson.relatedContentLoading) {
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
                                    //this.addToContent(response, memberResponse.binaryUrl.replace('http', 'https'));
                                    this.addToContent(response, memberResponse.binaryUrl.replace('http://', '//'));
                                });
                            }
                        });
                    } else {
                        this.addToContent(response);
                    }
                });
            });
        }
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

    updateActivePerson(index) {
        this.activePerson = this.stored[index];
        this.activePerson.name = this.getAbbreviatedName(this.activePerson.prefLabel);
        this.activePerson.contentBuffer = {
            images: [],
            noimages: []
        };
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
        uuid = uuid.replace('http://api.ft.com/things/', '');
        this.stored.forEach((person, index) => {
            if (person.id.replace('http://api.ft.com/things/', '') === uuid) {
                this.updateActivePerson(index);
            }
        });
    }

    acceptedSearchPerson(person) {
        this.elasticSearchPerson = person;
    }

}

export default new PeopleData();
