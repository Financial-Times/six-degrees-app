import PeopleData from '../../models/services/people.data.js';
import {ObserverLocator} from 'aurelia-framework';

export class BusinessCard {
    static inject() {
        return [ObserverLocator];
    }

    constructor(observerLocator) {

        this.observerLocator = observerLocator;
        this.update();
        this.directLinks = null;

        this.onPersonChange = () => {
            this.update();
        };

        this.toggleDirectLinks = (highlighted) => {
            this.directLinks.forEach(link => {
                d3.select(link).classed('highlighted', highlighted);
            });
        };

        this.observerLocator.getObserver(PeopleData, 'activePerson').subscribe(this.onPersonChange);
    }

    findDirectLinks(nodeId) {
        const connections = d3.select('.links').selectAll('line')[0],
            directLinks = [];

        connections.forEach(connection => {
            if ((connection.id.indexOf(nodeId) !== -1)) {
                directLinks.push(connection);
            }
        });
        return directLinks;
    }

    update() {
        this.person = PeopleData.activePerson;
    }

    highlightActiveOnGraph() {
        d3.selectAll('.node').classed('pale', true);
        d3.selectAll('.link').classed('pale', true);
        d3.select('.node-root').classed('node-highlighted', true);
    }

    cancelHighlightingActiveOnGraph() {
        d3.selectAll('.pale').classed('pale', false);
        d3.select('.node-root').classed('node-highlighted', false);
    }

    highlightDirectLinksOnGraph() {
        const id = PeopleData.activePerson.prefLabel;
        this.directLinks = this.findDirectLinks(id);
        this.toggleDirectLinks(true);
    }

    cancelHighlightingDirectLinksOnGraph() {
        this.toggleDirectLinks(false);
        this.directLinks = null;
    }

}
