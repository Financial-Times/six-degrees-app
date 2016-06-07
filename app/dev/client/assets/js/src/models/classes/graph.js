import PeopleData from '../../models/services/people.data.js';

let counts;

export class Graph {
    constructor(data) {

        (function init() {
            counts = 0;
            data.links.forEach(link => {
                counts += link.count;
            });
        }());

        function determineConnectionStrength(count) {
            return parseInt(count * 100 / counts, 10) / 10;
        }

        this.createSvg = function createSvg(element) {

            const width = element.parentNode.offsetWidth,
                height = element.parentNode.offsetHeight;

            return d3.select('#graph')
                .append('div')
                .classed('svg-container', true)
                .append('svg')
                .attr('preserveAspectRatio', 'xMinYMin meet')
                .attr('viewBox', '0 0 ' + width + ' ' + height)
                .classed('svg-content-responsive', true);
        };

        this.createForce = function createForce(container) {
            return d3.layout.force()
                .gravity(0.05)
                // .linkDistance(function (link) {
                //     return 100 - determineConnectionStrength(link.count) * 10;
                // })
                .linkDistance(function () {
                    return 40;
                })
                .charge(-2000)
                .size([container.offsetWidth, container.offsetHeight]);
        };

        this.handleLinks = function handleLinks(svg) {
            return svg.selectAll('.link')
                .data(data.links)
                .enter().append('line')
                .style('stroke-width', function (link) {
                    return 1 + determineConnectionStrength(link.count);
                })
                .attr('class', 'link');
        };

        this.handleNodes = function handleNodes(svg, force) {
            return svg.selectAll('.node')
                .data(data.nodes)
                .enter().append('g')
                .attr('class', function (node) {
                    return node.id === 0 ? 'node-root' : 'node';
                })
                .call(force.drag);
        };

        this.addCaptions = function addCaptions(nodes) {
            function getBB(selection) {
                selection.each(function (d) {
                    d.bbox = this.getBBox();
                });
            }
            nodes.append('text')
                .text(function (d) {
                    return d.caption;
                })
                .attr('dx', function () {
                    return '-' + this.getComputedTextLength() / 2;
                })
                .attr('dy', function (node) {
                    return node.id === 0 ? '2.5em' : '2.2em';
                })
                .call(getBB);
        };

        this.onClick = function onClick(nodeElement, nodeData, nodes, links) {
            // let centerX = data.nodes[0].x,
            //     centerY = data.nodes[0].y;

            if (d3.event.defaultPrevented) {
                return;
            }

            d3.select(nodeElement)
                .attr('r', 25);

            nodes[0].forEach(function (node, index) {
                if (index === nodeData.index) {
                    // data.nodes[0].fixed = false;
                    // data.nodes[index].fixed = true;
                    // data.nodes[index].x = centerX;
                    // data.nodes[index].y = centerY;

                    d3.select(node).attr('class', 'node-active');
                } else {
                    d3.select(node).attr('class', 'node-no-text');
                }
            });

            nodes.transition().duration(250).attr('transform', function () {
                return 'translate(' + nodeData.x + ',' + nodeData.y + ')';
            });

            links.transition().duration(150).style('stroke-width', 0);

            window.setTimeout(function () {
                PeopleData.setActive(nodeData.personId);
            }, 300);
        };

        this.addCircles = function addCircles(nodes, links) {
            const graph = this;

            nodes.append('circle')
                .attr('r', function (node) {
                    return node.id === 0 ? 24 : 20;
                })
                .on('click', function (nodeData) {
                    if (nodeData.id !== 0) {
                        graph.onClick(this, nodeData, nodes, links);
                    }
                });
        };

        this.startAndHandleForce = function startAndHandleForce(force, nodes, links) {
            force.nodes(data.nodes).links(data.links).start();

            force.on('tick', function () {

                links
                    .attr('x1', function (d) {
                        return d.source.x;
                    })
                    .attr('y1', function (d) {
                        return d.source.y;
                    })
                    .attr('x2', function (d) {
                        return d.target.x;
                    })
                    .attr('y2', function (d) {
                        return d.target.y;
                    });

                nodes
                    .attr('transform', function (d) {
                        return 'translate(' + d.x + ',' + d.y + ')';
                    });
            });

        };

        this.fixRootNode = function fixRootNode(container, x, y) {
            data.nodes[0].fixed = true;
            data.nodes[0].x = x || container.offsetWidth / 2;
            data.nodes[0].y = y || container.offsetHeight / 2;
            return data;
        };
    }
}
