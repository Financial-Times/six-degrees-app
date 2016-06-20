import {ObserverLocator} from 'aurelia-framework';
import BrowsingHistoryData from '../../models/services/browsing.history.js';

export class BrowsingHistory {
    static inject() {
        return [ObserverLocator];
    }

    constructor(observerLocator) {
        this.observerLocator = observerLocator;
        this.update = () => {
            this.history = BrowsingHistoryData.get().split(',').reverse();
            this.history.forEach((name, index) => {
                if (name === '#') {
                    this.history.splice(index, 1);
                }
            });
        };
        this.observerLocator.getObserver(BrowsingHistoryData, 'storage').subscribe(this.update);
    }

    getAbbreviatedName(prefLabel) {
        const prefLabelArray = prefLabel.split(' '),
            max = prefLabelArray.length;
        return prefLabelArray[0] + ' ' + prefLabelArray[max - 1];
    }

    highlightPersonOnGraph(person) {
        const self = this;

        d3.selectAll('.link').classed('pale', true);
        d3.selectAll('.node').classed('pale', true);

        d3.selectAll('.node').each(function (d) {
            const abbreviatedName = self.getAbbreviatedName(d.id);

            if (abbreviatedName === person) {
                d3.select(this).classed('node-active', true);
            }

        });
    }

    cancelHighlightingPersonOnGraph() {
        d3.selectAll('.pale').classed('pale', false);
        d3.select('.node-active.node-visited').classed('node-active', false);
    }

    highlightRouteOnGraph() {
        d3.selectAll('.link').classed('pale', true);
        d3.selectAll('.node').classed('pale', true);

        d3.select('.node-root').classed('route-highlight', true);
        d3.selectAll('.node-visited').each(function () {
            d3.select(this).classed('route-highlight', true);
        });
        d3.selectAll('.link.marked').each(function () {
            d3.select(this).classed('route-highlight', true);
        });
    }

    cancelHighlightingRouteOnGraph() {
        d3.selectAll('.pale').classed('pale', false);
        d3.selectAll('.route-highlight').classed('route-highlight', false);
    }

}
