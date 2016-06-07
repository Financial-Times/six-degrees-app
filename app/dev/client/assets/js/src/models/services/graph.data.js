import PeopleData from 'models/services/people.data.js';

export class GraphData {
    constructor() {
        function parseResponse(activePerson, connections) {
            const connectionsGraph = {
                'nodes': [{
                    id: 0,
                    uuid: activePerson.id,
                    caption: activePerson.prefLabel
                }],
                'links': []
            };

            connections.forEach(function (connection, index) {
                connectionsGraph.nodes.push({
                    id: index + 1,
                    personId: connection.person.id,
                    uuid: connection.person.id,
                    caption: connection.person.prefLabel
                });
                connectionsGraph.links.push({
                    source: 0,
                    target: index + 1,
                    count: connection.count
                });
            });

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
