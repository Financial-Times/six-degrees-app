import {Router} from 'aurelia-router';
import {ObserverLocator} from 'aurelia-framework';
import PeopleData from '../../models/services/people.data.js';

export class PeopleList {
    static inject() {
        return [Router, ObserverLocator];
    }

    constructor(router, observerLocator) {
        this.theRouter = router;
        this.observerLocator = observerLocator;
        this.heroLabel = 'was the most mentioned person<em>in the Financial Times</em>in last 7 days';
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
