import PeopleData from 'models/services/people.data.js';

export class GraphData {
    constructor() {
        function parseResponse(activePerson, connections) {
            const connectionsGraph = {
                'nodes': [{
                    uuid: activePerson.id,
                    caption: activePerson.prefLabel
                }],
                'links': []
            };

            let edges = []; //eslint-disable-line prefer-const

            connections.forEach(function (connection, index) {
                connectionsGraph.nodes.push({
                    personId: connection.person.id,
                    uuid: connection.person.id,
                    caption: connection.person.prefLabel
                });
                connectionsGraph.links.push({
                    source: connectionsGraph.nodes[0].uuid,
                    target: connectionsGraph.nodes[index + 1].uuid,
                    count: connection.count
                });
            });

            connectionsGraph.links.forEach(function (edge) {

                const sourceNode = connectionsGraph.nodes.filter(function (node) {
                        return node.uuid === edge.source;
                    })[0],
                    targetNode = connectionsGraph.nodes.filter(function (node) {
                        return node.uuid === edge.target;
                    })[0];

                edges.push({
                    source: sourceNode,
                    target: targetNode,
                    count: edge.count
                });
            });

            connectionsGraph.links = edges;

            return connectionsGraph;
        }

        this.fetch = function (activePerson) {

            function getActivePersonUuid() {
                return activePerson && activePerson.id ? activePerson.id.replace('http://api.ft.com/things/', '') : null;
            }

            return PeopleData.getConnections(getActivePersonUuid()).then(response => {
                return parseResponse(activePerson, response);
            });
        };
    }
}
