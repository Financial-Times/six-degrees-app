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
    }

    goBack() {
        self.clearErrorMessage();
        self.graphData = null;
        this.router.navigate('/');
    }

    handleData(data) {
        self.graphData = data;

        const graphElement = document.getElementById('graph'),
            graph = new Graph(data),
            svg = graph.createSvg(graphElement),
            force = graph.createForce(graphElement),
            links = graph.handleLinks(svg),
            nodes = graph.handleNodes(svg, force);

        graph.addCaptions(nodes);
        graph.addCircles(nodes, links);

        data = graph.fixRootNode(graphElement, graphElement.parentNode.offsetWidth / 2, graphElement.parentNode.offsetHeight / 2);

        graph.startAndHandleForce(force, nodes, links);
    }

    draw() {
        self.clearErrorMessage();
        self.graphData = null;
        d3.select('#graph .svg-container').remove();

        if (self) {
            console.warn('new person detected', PeopleData.activePerson.prefLabel);
            new GraphData().fetch(PeopleData.activePerson).then(self.handleData).catch(self.errorHandler);
        }
    }

    attached() {
        self = this;

        if (!self.drawnOnce) {
            self.draw();
            self.drawnOnce = true;
            self.observerLocator.getObserver(PeopleData, 'activePerson').subscribe(self.draw);
        }

    }

}

