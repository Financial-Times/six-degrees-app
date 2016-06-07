import {Router} from 'aurelia-router';
import {ObserverLocator} from 'aurelia-framework';
import PeopleData from '../models/services/people.data.js';

export class Connections {
    static inject() {
        return [Router, ObserverLocator];
    }

    constructor(router, observerLocator) {
        this.router = router;
        this.observerLocator = observerLocator;
    }

    activate() {
        if (PeopleData.activePerson) {
            this.person = PeopleData.activePerson;
        } else {
            this.router.navigate('/');
        }

        this.observerLocator.getObserver(PeopleData, 'activePerson').subscribe(() => {
            this.person = PeopleData.activePerson;
        });
    }

    changePerson(event, id) {
        event.preventDefault();
        event.stopPropagation();
        PeopleData.setActive(id);
        this.person = PeopleData.activePerson;
    }
}
