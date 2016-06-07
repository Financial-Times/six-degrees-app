import PeopleData from '../../models/services/people.data.js';
import {ObserverLocator} from 'aurelia-framework';

export class BusinessCard {
    static inject() {
        return [ObserverLocator];
    }

    constructor(observerLocator) {
        this.person = PeopleData.activePerson;
        this.observerLocator = observerLocator;

        this.onPersonChange = () => {
            this.person = PeopleData.activePerson;
        };

        this.observerLocator.getObserver(PeopleData, 'activePerson').subscribe(this.onPersonChange);
    }
}
