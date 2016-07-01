import {Router} from 'aurelia-router';
import {ObserverLocator} from 'aurelia-framework';
import PeopleData from '../../models/services/people.data.js';
import UserData from '../../models/services/user.data.js';
import Cookies from '../../models/services/cookies.js';

export class PeopleList {
    static inject() {
        return [Router, ObserverLocator];
    }

    constructor(router, observerLocator) {
        this.theRouter = router;
        this.observerLocator = observerLocator;
        this.signedIn = Cookies.read('FTSession');
        this.heroLabel = 'was the most mentioned person<em>' + (this.signedIn ? 'in articles you have read' : 'in Financial Times') + '</em>in the last 7 days';
    }

    getMentionedPeople(uuid) {
        PeopleData.getMentionedMostly(uuid).then(people => {
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
        this.getMentionedPeople(UserData.uuid);
    }

    redirect(id) {
        PeopleData.setActive(id);
        this.theRouter.navigate('connections');
    }

    attached() {

        if (!this.signedIn) {
            this.getMentionedPeople();
        } else {
            const self = this;
            UserData.obtainUuid(Cookies.read('FTSession'), self.getMentionedPeople);
        }

        this.observerLocator.getObserver(PeopleData, 'elasticSearchPerson').subscribe((person) => {
            this.elasticSearchPerson = person;
            this.heroLabel = null;
        });
        this.observerLocator.getObserver(PeopleData, 'stored').subscribe((people) => {
            this.people = people;
            this.hero = people[0];

            if (this.hero._source && this.hero._source.aliases) {//eslint-disable-line no-underscore-dangle
                const aliases = [];
                this.hero._source.aliases.forEach(alias => {//eslint-disable-line no-underscore-dangle
                    if (alias !== this.hero.name) {
                        aliases.push(alias);
                    }
                });
                this.hero.aliases = aliases;
            }
        });
    }
}
