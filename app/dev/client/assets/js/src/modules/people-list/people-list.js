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
        this.user = UserData.getUserDetails();

        this.getMentionedPeople = (uuid) => {
            PeopleData.personalized = uuid ? true : false;

            PeopleData.getMentionedMostly(uuid).then(people => {
                if (people && people.length) {
                    people.forEach(person => {
                        person.name = PeopleData.getAbbreviatedName(person.prefLabel);
                        PeopleData.getImage(person.name).then(imageData => {
                            person.imageUrl = imageData.url;
                        });
                    });
                    this.hero = people[0];
                    this.people = people;
                    PeopleData.storeMentioned(people);
                } else {
                    PeopleData.personalized = false;
                    this.getMentionedPeople();
                }
            }).catch(error => {
                PeopleData.personalized = false;
                if (error.status && error.status !== 504) {
                    this.getMentionedPeople();
                } else {
                    this.errorMessage = 'Oops, something went wrong... (' + error.status + ')';
                }
            });
        };

        this.updateheroLabel = () => {
            this.heroLabel = 'mentioned mostly <em>in FT articles ' + (this.signedIn && PeopleData.personalized ? ' that you have read ' : '') + '</em>in the last 7 days';
        };
    }

    tryAgain() {
        this.errorMessage = null;
        this.getMentionedPeople(UserData.uuid);
    }

    redirect(id) {
        this.theRouter.navigate('connections/' + PeopleData.setActiveByUuid(id));
    }

    attached() {
        this.updateheroLabel();

        if (!this.signedIn) {
            this.getMentionedPeople();
        } else {
            UserData.obtainUuid(this.getMentionedPeople);
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

        this.observerLocator.getObserver(PeopleData, 'personalized').subscribe(this.updateheroLabel);
    }
}
