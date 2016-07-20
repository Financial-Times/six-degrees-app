import {ObserverLocator} from 'aurelia-framework';
import PeopleData from '../../models/services/people.data.js';
import BrowsingHistory from '../../models/services/browsing.history.js';
import GraphSettings from '../../models/services/graph.settings.js';

export class Graph {
    static inject() {
        return [ObserverLocator];
    }

    constructor(observerLocator) {
        this.observerLocator = observerLocator;
        this.graphMode = GraphSettings.getMode();

        const zoom = d3.behavior.zoom().scaleExtent([0.5, 2]).on('zoom', zoomed), //eslint-disable-line no-use-before-define
            force = d3.layout.force(),
            nodes = force.nodes(),
            links = force.links(),
            element = document.getElementById('graph'),
            width = element.parentNode.offsetWidth,
            height = element.parentNode.offsetHeight,
            tooltip = d3.select('body').append('div')
                .attr('class', 'tooltip')
                .style('opacity', 0),
            svg = d3.select('#graph')
                .append('div')
                .classed('svg-container', true)
                .append('svg:svg')
                .attr('width', width)
                .attr('height', height)
                .attr('id', 'svg')
                .attr('pointer-events', 'all')
                .attr('viewBox', '0 0 ' + width + ' ' + height)
                .attr('perserveAspectRatio', 'xMinYMid meet')
                .classed('svg-content-responsive', true)
                .call(zoom)
                .append('svg:g');

        let previousNodeId, previousNodeUuid;

        window.onresize = function () {
            d3.select('#graph svg:first-child').attr('width', element.parentNode.offsetWidth).attr('height', element.parentNode.offsetHeight);
        };

        function zoomed(pos, sc) {
            const position = pos || zoom.translate(),
                scale = sc || zoom.scale();

            svg.attr('transform', 'translate(' + position + ')scale(' + scale + ')');
        }

        function zoomByFactor(factor) {
            const scale = zoom.scale(),
                extent = zoom.scaleExtent(),
                newScale = scale * factor;

            if (extent[0] <= newScale && newScale <= extent[1]) {
                const t = zoom.translate(),
                    c = [width / 2, height / 2];

                zoom.scale(newScale)
                    .translate(
                        [c[0] + (t[0] - c[0]) / scale * newScale,
                        c[1] + (t[1] - c[1]) / scale * newScale])
                    .event(svg.transition().duration(350));
            }
        }

        function getConnectionTooltipContent(d) {
            return '<span>Click at the link<br />to see articles with</span><i class="material-icons">play_arrow</i><em><strong>' + PeopleData.getAbbreviatedName(d.source.id) + '</strong>and<strong>' + PeopleData.getAbbreviatedName(d.target.id) + '</strong></em>';
        }

        function findNode(id) {
            let i,
                node = null;

            for (i in nodes) {
                if (nodes[i].id === id) {
                    node = nodes[i];
                }
            }

            return node;
        }

        function findNodeIndex(id) {
            let i, index;

            for (i = 0; i < nodes.length; i += 1) {
                if (nodes[i].id === id) {
                    index = i;
                }
            }
            return index;
        }

        function findDirectLinks(nodeId) {
            const connections = svg.select('.links').selectAll('line')[0],
                directLinks = [];
            connections.forEach(connection => {
                if ((connection.id.indexOf(nodeId) !== -1)) {
                    directLinks.push(connection);
                }
            });
            return directLinks;
        }

        function findLink(edgeOne, edgeTwo) {
            let connectionExists = null;
            const connections = svg.select('.links').selectAll('line')[0];

            connections.forEach(connection => {
                if ((connection.id === edgeOne + '-' + edgeTwo || connection.id === edgeTwo + '-' + edgeOne)) {
                    connectionExists = connection;
                }
            });

            return connectionExists;
        }

        function markConnection(edgeOne, edgeTwo) {
            const link = findLink(edgeOne, edgeTwo);
            let areDirectlyConnected = false;

            if (link) {
                d3.select(link).attr('class', 'link marked');
                areDirectlyConnected = true;
            }

            if (!areDirectlyConnected || BrowsingHistory.contains(PeopleData.activePerson.name) || (PeopleData.sourcePerson && PeopleData.activePerson.name === PeopleData.sourcePerson.name)) {
                svg.select('.links').selectAll('line.marked').attr('class', 'link');
                svg.select('.nodes').selectAll('g.node-visited').attr('class', 'node');
                BrowsingHistory.clear();
                PeopleData.sourcePerson = Object.assign({}, PeopleData.activePerson);
            }
        }

        function findDirectlyConnectedNodes(id, directLinks) {
            const directlyConnectedPeople = [],
                directlyConnectedNodes = [];

            directLinks.forEach(link => {
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

        function update() {
            let line, link, node, nodeEnter,
                linksTotalValue = 0;

            svg.append('g').attr('class', 'links');
            svg.append('g').attr('class', 'nodes');

            function calculateLinkQuota(singleLinkValue) {
                return singleLinkValue * 100 / linksTotalValue;
            }

            link = svg.select('.links').selectAll('line').data(links, function (d) { //eslint-disable-line prefer-const
                return d.source.id + '-' + d.target.id;
            });

            line = link.enter().append('line')//eslint-disable-line prefer-const
                .attr('id', function (d) {
                    return d.source.id + '-' + d.target.id;
                })
                .attr('stroke-width', function (d) {
                    return d.value;
                }).on('mouseover', function (d) {
                    const coordinates = d3.mouse(this),
                        posX = coordinates[0],
                        posY = coordinates[1];
                    d3.select(this).attr('stroke-width', 16);

                    tooltip.transition().duration(200)
                        .style('opacity', 0.9);

                    tooltip.html(getConnectionTooltipContent(d))
                        .style('left', posX + 'px')
                        .style('top', posY + 'px');

                }).on('mouseout', function (d) {
                    tooltip.transition().duration(0)
                        .style('opacity', 0)
                        .style('left', '-100px')
                        .style('top', '-100px');
                    d3.select(this).attr('stroke-width', d.value);
                }).on('click', function (d) {
                    d3.select('.duo-content').classed('duo-content', false);
                    d3.select(this).classed('duo-content', true);
                    PeopleData.filterContentForTwo(PeopleData.getAbbreviatedName(d.source.id), PeopleData.getAbbreviatedName(d.target.id), d.source.uuid, d.target.uuid);
                });

            line.attr('class', function () {
                return 'link';
            });

            link.exit().remove();

            node = svg.select('.nodes').selectAll('g.node').data(nodes, function (d) { //eslint-disable-line prefer-const
                return d.id;
            });

            nodeEnter = node.enter().append('g') //eslint-disable-line prefer-const
                .attr('class', function (d, index) {
                    if (index === 0) {
                        d.fixed = true;
                        d.x = width / 2;
                        d.y = height / 2;
                    }
                    return index === 0 ? 'node node-root' : 'node';
                })
                .call(force.drag);

            nodeEnter.append('svg:circle')
                .attr('r', function (d, index) {
                    return index === 0 ? 25 : 20;
                })
                .on('click', function (nodeData) {
                    d3.select('.duo-content').classed('duo-content', false);
                    svg.select('.nodes').selectAll('g.node circle').attr('r', 20);
                    svg.select('.nodes').selectAll('g.node-root').attr('class', 'node node-visited');

                    d3.select(this).attr('r', 25);
                    d3.select(this.parentNode).attr('class', 'node node-root');

                    nodes.forEach(item => {
                        item.fixed = false;
                    });
                    nodeData.fixed = true;

                    if (nodeData.focus) {
                        delete nodeData.focus;
                        nodeData.px = width / 2;
                        nodeData.py = height / 2;
                        //zoomed([0, 0], 1); TODOOOOOO, ale na osobnym przycisku!
                        PeopleData.targetPerson = null;
                    }

                    previousNodeId = PeopleData.activePerson.prefLabel;
                    previousNodeUuid = PeopleData.activePerson.id;
                    PeopleData.setActiveByUuid(nodeData.uuid);

                    if (previousNodeId) {
                        const name = PeopleData.getAbbreviatedName(previousNodeId);
                        if (!BrowsingHistory.contains(name)) {
                            BrowsingHistory.add(name, previousNodeUuid);
                        }
                        markConnection(previousNodeId, PeopleData.activePerson.prefLabel);
                    }

                })
                .on('mouseover', function (d) {
                    const connection = findLink(PeopleData.activePerson.prefLabel, d.id),
                        directLinks = findDirectLinks(d.id),
                        graphMode = GraphSettings.getMode();

                    if (graphMode === true) {
                        directLinks.forEach(directLink => {
                            d3.select(directLink).classed('highlighted', true);
                        });

                        d3.selectAll('.node').classed('pale', true);
                        findDirectlyConnectedNodes(d.id, directLinks).forEach(directNode => {
                            d3.select(directNode).classed('pale', false);
                            d3.select(directNode).classed('node-direct', true);
                        });

                        if (PeopleData.activePerson.prefLabel !== d.id) {
                            if (connection) {
                                d3.select(connection).classed('highlighted', false);
                                d3.select(connection).classed('hover', true);
                                d3.select(this.parentNode).classed('node-active', true);
                            } else {
                                d3.select(this.parentNode).classed('node-no-connection', true);
                            }
                        }
                    }
                })
                .on('mouseout', function () {
                    d3.selectAll('.link.hover').classed('hover', false);
                    d3.selectAll('.link.highlighted').classed('highlighted', false);
                    d3.selectAll('.node-active').classed('node-active', false);
                    d3.selectAll('.node-no-connection').classed('node-no-connection', false);
                    d3.selectAll('.pale').classed('pale', false);
                    d3.selectAll('.node-direct').classed('node-direct', false);
                });

            nodeEnter.append('svg:rect')
                .attr('width', 0)
                .attr('height', 0)
                .attr('x', 0)
                .attr('y', 0);

            nodeEnter.append('svg:text')
                .attr('id', function (d) {
                    return d.id.replace(/ /g, '-');
                })
                .attr('x', function () {
                    return 0;
                })
                .attr('y', function () {
                    return '1.4em';
                }).each(function (d) {
                    const arrayOfWords = PeopleData.getAbbreviatedName(d.id).split(' ');

                    d3.select(this).append('tspan')
                        .text(arrayOfWords[0])
                        .attr('x', '0')
                        .attr('dy', '1em')
                        .attr('class', 'name firstname');

                    d3.select(this).append('tspan')
                        .text(arrayOfWords[1])
                        .attr('x', '0')
                        .attr('dy', '1em')
                        .attr('class', 'name lastname');

                    d3.select(this).append('tspan')
                        .text('no direct')
                        .attr('x', '0')
                        .attr('dy', '1.4em')
                        .attr('class', 'no-connection-hint');

                    d3.select(this).append('tspan')
                        .text('connection to')
                        .attr('x', '0')
                        .attr('dy', '1em')
                        .attr('class', 'no-connection-hint');

                    d3.select(this).append('tspan')
                        .text('active node')
                        .attr('x', '0')
                        .attr('dy', '1em')
                        .attr('class', 'no-connection-hint');

                    window.setTimeout(() => {
                        const textWidth = this.getBBox().width + 36,
                            textHeight = this.getBBox().height + 16,
                            textX = this.getBBox().x - 18,
                            textY = this.getBBox().y;

                        d3.select(this.parentNode)
                            .insert('rect', ':first-child')
                            .attr({
                                class: 'hint-bg',
                                width: textWidth,
                                height: textHeight,
                                x: textX,
                                y: textY
                            });
                    }, 1000);

                });

            node.exit().remove();

            force.on('tick', function () {

                node.attr('transform', function (d) {
                    return 'translate(' + d.x + ',' + d.y + ')';
                });

                link.attr('x1', function (d) {
                    return d.source.x;
                }).attr('y1', function (d) {
                    return d.source.y;
                })
                .attr('x2', function (d) {
                    return d.target.x;
                })
                .attr('y2', function (d) {
                    return d.target.y;
                });
            });

            links.forEach(singleLink => {
                linksTotalValue += singleLink.value;
            });

            // Restart the force layout.
            force.gravity(0.5)
                .charge(-5000)
                .linkDistance(function (d) {
                    return 110 - calculateLinkQuota(d.value);
                })
                .size([width, height])
                .start();

            d3.selectAll('.connections-zoom-controls a').on('click', function () {
                const factor = (this.id === 'zoom_in') ? 1.2 : (1 / 1.2);
                d3.event.preventDefault();
                this.blur();
                zoomByFactor(factor);
            });

            if (previousNodeId) {
                markConnection(previousNodeId, PeopleData.activePerson.prefLabel);
            }

            if (!PeopleData.sourcePerson) {
                PeopleData.sourcePerson = Object.assign({}, PeopleData.activePerson);
            }

        }

        this.addNode = function (id, uuid) {
            nodes.push({
                'id': id,
                'uuid': uuid
            });

            update();
        };

        this.removeNode = function (id) {
            const n = findNode(id);
            let i = 0;

            while (i < links.length) {
                if ((links[i].source === n) || (links[i].target === n)) {
                    links.splice(i, 1);
                } else {
                    i += 1;
                }
            }

            nodes.splice(findNodeIndex(id), 1);

            update();
        };

        this.removeLink = function (source, target) {
            let i;

            for (i = 0; i < links.length; i += 1) {
                if (links[i].source.id === source && links[i].target.id === target) {
                    links.splice(i, 1);
                    break;
                }
            }
            update();
        };

        this.removeallLinks = function () {
            links.splice(0, links.length);
            update();
        };

        this.removeAllNodes = function () {
            nodes.splice(0, links.length);
            update();
        };

        this.addLink = function (source, target, value) {
            const max = links.length;
            let x,
                exists = false;

            for (x = 0; x < max; x += 1) {
                if (source === links[x].source.id && target === links[x].target.id) {
                    links[x].value += value;
                    exists = true;
                    break;
                }
            }

            if (!exists) {
                links.push({
                    'source': findNode(source),
                    'target': findNode(target),
                    'value': value
                });
                update();
            }

        };
    }
}
