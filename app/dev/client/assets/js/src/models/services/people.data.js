import Ajax from '../../models/services/ajax.js';

class PeopleData {

    constructor() {
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
                url: 'http://api.ft.com/content/' + item.id + '?apiKey=vg9u6GResCWNIwqGCdNZVaL7RdEOCtGo'
            }).then(response => {

                if (response.mainImage.id) {
                    Ajax.get({
                        url: response.mainImage.id + '?apiKey=vg9u6GResCWNIwqGCdNZVaL7RdEOCtGo'
                    }).then(imageResponse => {
                        if (imageResponse.members) {
                            Ajax.get({
                                url: imageResponse.members[0].id + '?apiKey=vg9u6GResCWNIwqGCdNZVaL7RdEOCtGo'
                            }).then(memberResponse => {
                                this.addToContent(response, memberResponse.binaryUrl);
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
            this.getContent(response[0].content);
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
            }
        });

    }

}

export default new PeopleData();
