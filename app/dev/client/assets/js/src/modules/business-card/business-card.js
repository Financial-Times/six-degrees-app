import PeopleData from '../../models/services/people.data.js';
import {ObserverLocator} from 'aurelia-framework';
import GraphSettings from '../../models/services/graph.settings.js';

export class BusinessCard {
    static inject() {
        return [ObserverLocator];
    }

    constructor(observerLocator) {

        this.observerLocator = observerLocator;
        this.update();
        this.directLinks = null;
        this.graphMode = GraphSettings.getMode();

        this.onPersonChange = () => {
            this.update();
        };

        this.toggleDirectLinks = (highlighted) => {
            this.directLinks.forEach(link => {
                d3.select(link).classed('highlighted', highlighted);
            });
        };

        this.observerLocator.getObserver(PeopleData, 'activePerson').subscribe(this.onPersonChange);
        this.observerLocator.getObserver(GraphSettings, 'mode').subscribe(() => {
            this.graphMode = GraphSettings.getMode();
        });
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

    findDirectlyConnectedNodes(id, links) {
        const directlyConnectedPeople = [],
            directlyConnectedNodes = [];

        links.forEach(link => {
            directlyConnectedPeople.push(link.id.replace(id + '-', '').replace('-' + id, '').replace(/ /g, '-'));
        });

        d3.selectAll('text')[0].forEach(text => {
            directlyConnectedPeople.forEach(personId => {
                if (personId === text.id) {
                    directlyConnectedNodes.push(text.parentNode);
                }
            });
        });

        return directlyConnectedNodes;
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
        this.directlyConnectedNodes = this.findDirectlyConnectedNodes(id, this.directLinks);

        d3.selectAll('.link').classed('pale', true);
        this.toggleDirectLinks(true);

        d3.selectAll('.node').classed('pale', true);
        this.directlyConnectedNodes.forEach(node => {
            d3.select(node).classed('pale', false);
            d3.select(node).classed('node-direct', true);
        });

    }

    cancelHighlightingDirectLinksOnGraph() {
        d3.selectAll('.pale').classed('pale', false);
        d3.selectAll('.node-direct').classed('node-direct', false);
        this.toggleDirectLinks(false);
        this.directLinks = null;
    }

}
