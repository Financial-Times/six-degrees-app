import Ajax from '../../models/services/ajax.js';

class PeopleData {

    constructor() {
        this.elasticSearchPerson = null;
        this.people = {};
    }

    addToContent(response, imageUrl) {
        this.activePerson.relatedContentLoading = false;
        this.activePerson.relatedContent.push({
            title: response.title,
            imageUrl: imageUrl,
            byline: response.byline,
            published: moment(response.publishedDate).format('MMMM DD, YYYY'),
            location: {
                uri: response.webUrl
            }
        });
        this.activePerson.maxContentItems = this.activePerson.relatedContent.length > 3 ? 5 : this.activePerson.relatedContent.length;
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
                this.getContent(response[0].content);
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

    setActive(id) {

        this.stored.forEach((person, index) => {
            if (person.id === id) {
                this.activePerson = this.stored[index];
            }
        });

    }

    acceptedSearchPerson(person) {
        this.elasticSearchPerson = person;
    }

}

export default new PeopleData();
