import {Router} from 'aurelia-router';
import PeopleData from '../../models/services/people.data.js';

export class PeopleList {
    static inject() {
        return [Router];
    }

    constructor(router) {
        this.theRouter = router;
    }

    getMentionedPeople() {
        PeopleData.getMentionedMostly().then(people => {
            if (people && people.length) {
                this.hero = people[0];
                this.people = people;
                PeopleData.storeMentioned(people);
            }
        }).catch(error => {
            if (error.status) {
                this.errorMessage = 'Oops, something went wrong... (' + error.status + ')';
            }
        });
    }

    tryAgain() {
        this.errorMessage = null;
        this.getMentionedPeople();
    }

    redirect(id) {
        PeopleData.setActive(id);
        this.theRouter.navigate('connections');
    }

    attached() {
        this.getMentionedPeople();
    }
}
