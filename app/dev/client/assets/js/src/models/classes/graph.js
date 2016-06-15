import PeopleData from '../../models/services/people.data.js';

export class Graph {
    constructor() {

        const zoom = d3.behavior.zoom().scaleExtent([0.5, 2]).on('zoom', zoomed), //eslint-disable-line no-use-before-define
            force = d3.layout.force(),
            nodes = force.nodes(),
            links = force.links(),
            element = document.getElementById('graph'),
            width = element.parentNode.offsetWidth,
            height = element.parentNode.offsetHeight,
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

        function zoomed() {
            svg.attr('transform', 'translate(' + zoom.translate() + ')scale(' + zoom.scale() + ')');
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

        function update() {
            let link, node, nodeEnter;

            svg.append('g').attr('class', 'links');
            svg.append('g').attr('class', 'nodes');

            link = svg.select('.links').selectAll('line').data(links, function (d) { //eslint-disable-line prefer-const
                return d.source.id + '-' + d.target.id;
            });

            link.enter().append('line')
                .attr('id', function (d) {
                    return d.source.id + '-' + d.target.id;
                })
                .attr('stroke-width', function (d) {
                    return d.value / 10;
                })
                .attr('class', 'link');

            link.append('title')
                .text(function (d) {
                    return d.value;
                });

            link.exit().remove();

            node = svg.select('.nodes').selectAll('g.node').data(nodes, function (d) { //eslint-disable-line prefer-const
                return d.id;
            });

            nodeEnter = node.enter().append('g') //eslint-disable-line prefer-const
                .attr('class', function (d, index) {
                    return index === 0 ? 'node node-root' : 'node';
                })
                .call(force.drag);

            nodeEnter.append('svg:circle')
                .attr('r', function (d, index) {
                    return index === 0 ? 25 : 20;
                })
                .on('click', function (nodeData) {
                    svg.select('.nodes').selectAll('g.node circle').attr('r', 20);
                    svg.select('.nodes').selectAll('g.node-root').attr('class', 'node');

                    d3.select(this).attr('r', 25);
                    d3.select(this.parentNode).attr('class', 'node node-root');

                    PeopleData.setActiveByName(nodeData.id);
                });

            nodeEnter.append('svg:text')
                .attr('x', function () {
                    return 0;
                })
                .attr('y', function () {
                    return '1.4em';
                }).each(function (d) {
                    const arrayOfWords = d.id.split(' '),
                        max = arrayOfWords.length;

                    d3.select(this).append('tspan')
                        .text(arrayOfWords[0])
                        .attr('x', '0')
                        .attr('dy', '1em');

                    d3.select(this).append('tspan')
                        .text(arrayOfWords[max - 1])
                        .attr('x', '0')
                        .attr('dy', '1em');
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

            // Restart the force layout.
            force.gravity(0.05)
                .charge(-2000)
                .linkDistance(function (d) {
                    return d.value * 10;
                })
                .size([width, height])
                .start();

            d3.selectAll('.connections-zoom-controls a').on('click', function () {
                const factor = (this.id === 'zoom_in') ? 1.2 : (1 / 1.2);
                d3.event.preventDefault();
                this.blur();
                zoomByFactor(factor);
            });

        }

        this.addNode = function (id) {
            nodes.push({
                'id': id
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
