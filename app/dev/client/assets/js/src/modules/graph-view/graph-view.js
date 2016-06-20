import {Router} from 'aurelia-router';
import {ObserverLocator} from 'aurelia-framework';
import {Graph} from '../../models/classes/graph.js';

import {GraphData} from '../../models/services/graph.data.js';
import PeopleData from '../../models/services/people.data.js';


let self;

export class GraphView {
    static inject() {
        return [ObserverLocator, Router];
    }
    constructor(observerLocator, router) {
        this.observerLocator = observerLocator;
        this.router = router;
        this.sourcePerson = null;
        this.targetPerson = null;
    }

    clearErrorMessage() {
        this.errorMessage = null;
        this.errorDetails = null;
    }

    errorHandler(error) {
        if (error.status) {
            self.errorMessage = 'Oops, something went wrong...';
            self.errorDetails = '(' + error.status + ' - ' + error.statusText + ')';
        }
        self.pending = false;
        PeopleData.activePerson.numberOfConnections = '1';
    }

    goBack() {
        self.clearErrorMessage();
        self.graphData = null;
        d3.select('#graph .svg-container').remove();
        this.router.navigate('/');
    }

    handleData(data) {
        self.pending = false;
        self.drawGraph(data.nodes, data.links);
    }

    getGraphData() {
        self.clearErrorMessage();
        self.pending = true;
        self.sourcePerson = PeopleData.sourcePerson ? PeopleData.sourcePerson.name : null;
        self.targetPerson = PeopleData.activePerson && PeopleData.sourcePerson && PeopleData.sourcePerson.name !== PeopleData.activePerson.name ? PeopleData.activePerson.name : null;
        new GraphData().fetch(PeopleData.activePerson).then(self.handleData).catch(self.errorHandler);
    }

    drawGraph(nodes, links) {

        if (!self.graphData) {

            self.graph = new Graph();
            self.graphData = {
                nodes: [],
                links: []
            };

        } else {

            const oldNodes = self.graphData.nodes;
            let i;

            oldNodes.forEach(oldNode => {
                for (i = 0; i < nodes.length; i += 1) {
                    if (oldNode.caption === nodes[i].caption) {
                        nodes.splice(i, 1);
                        break;
                    }
                }
            });
        }

        nodes.forEach(node => {
            self.graph.addNode(node.caption);
        });

        links.forEach(link => {
            self.graph.addLink(link.source.caption, link.target.caption, link.count);
        });

        self.graphData.nodes = self.graphData.nodes.concat(nodes);
        self.graphData.links = self.graphData.links.concat(links);

        PeopleData.activePerson.numberOfConnections = links.length.toString();
    }

    attached() {
        self = this;
        self.observerLocator.getObserver(PeopleData, 'activePerson').subscribe(self.getGraphData);

        if (PeopleData.activePerson && !self.pending) {
            self.getGraphData();
        }
    }

}

