import {Router} from 'aurelia-router';
import {ObserverLocator} from 'aurelia-framework';
import {Graph} from '../../models/classes/graph.js';

import {GraphData} from '../../models/services/graph.data.js';
import GraphSettings from '../../models/services/graph.settings.js';
import PeopleData from '../../models/services/people.data.js';
import BrowsingHistoryData from '../../models/services/browsing.history.js';
import UserData from '../../models/services/user.data.js';

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
        this.graphMode = GraphSettings.getMode();
        this.signedIn = UserData.uuid;
        this.connectionsContext = 'people connections<br />in FT articles' + (this.signedIn && PeopleData.personalized ? ' that you have read' : '') + '<br />within the last 7 days';
    }

    clearErrorMessage() {
        this.errorMessage = null;
        this.errorDetails = null;
    }

    errorHandler(error) {
        if (error.status && !self.initialData) {
            self.errorMessage = 'Oops, something went wrong...';
            self.errorDetails = '(' + error.status + ' - ' + error.statusText + ')';
        }

        if (self.initialData) {
            PeopleData.activePerson.numberOfConnections = '1';
        }
        PeopleData.activePerson.connectionsSearchFailed = true;
        PeopleData.activePerson.connectionsRequestPending = false;
        self.pending = false;

    }

    goBack() {
        self.clearErrorMessage();
        self.graphData = null;
        PeopleData.sourcePerson = null;
        d3.select('#graph .svg-container').remove();
        BrowsingHistoryData.clear();
        this.router.navigate('/');
    }

    handleData(data) {
        self.initialData = true;
        self.pending = false;
        delete PeopleData.activePerson.connectionsSearchFailed;
        self.drawGraph(data.nodes, data.links);
        PeopleData.activePerson.connectionsRequestPending = false;
    }

    getGraphData() {
        self.clearErrorMessage();
        self.pending = true;
        PeopleData.activePerson.connectionsRequestPending = true;
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
            self.graph.addNode(node.caption, node.uuid);
        });

        links.forEach(link => {
            self.graph.addLink(link.source.caption, link.target.caption, link.count);
        });

        self.graphData.nodes = self.graphData.nodes.concat(nodes);
        self.graphData.links = self.graphData.links.concat(links);

        PeopleData.activePerson.numberOfConnections = links.length.toString();
    }

    toggleMode() {
        GraphSettings.setMode(!this.graphMode);
        this.graphMode = GraphSettings.getMode();
        document.getElementById('toggleModeBtn').blur();
    }

    attached() {
        self = this;
        self.observerLocator.getObserver(PeopleData, 'activePerson').subscribe(self.getGraphData);
        self.observerLocator.getObserver(PeopleData, 'targetPerson').subscribe(function (targetPerson) {
            self.targetPerson = targetPerson;
        });

        self.observerLocator.getObserver(PeopleData, 'duoContent').subscribe(() => {
            if (!PeopleData.duoContent && self.graph) {
                self.graph.clearDuoLink();
            }
        });

        if (PeopleData.activePerson && !self.pending) {
            self.getGraphData();
        }
    }

}

