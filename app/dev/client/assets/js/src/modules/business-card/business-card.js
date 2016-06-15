import PeopleData from '../../models/services/people.data.js';
import {ObserverLocator} from 'aurelia-framework';

export class BusinessCard {
    static inject() {
        return [ObserverLocator];
    }

    constructor(observerLocator) {

        this.observerLocator = observerLocator;
        this.update();

        this.onPersonChange = () => {
            this.update();
        };

        this.observerLocator.getObserver(PeopleData, 'activePerson').subscribe(this.onPersonChange);
    }

    update() {
        this.person = PeopleData.activePerson;
    }

}
