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

}
