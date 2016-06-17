class BrowsingHistoryData {
    constructor() {
        this.storage = '#';
    }

    add(name) {
        this.storage += (',' + name);
    }

    contains(name) {
        return this.storage.indexOf(name) !== -1;
    }

    clear() {
        this.storage = '#';
    }

    get() {
        return this.storage;
    }
}

export default new BrowsingHistoryData();
