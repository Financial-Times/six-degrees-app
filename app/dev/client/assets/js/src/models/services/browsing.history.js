class BrowsingHistoryData {
    constructor() {
        this.storage = '#';
        this.details = [];
    }

    add(name, id) {
        this.storage += (',' + name);
        this.details.push({
            id: id,
            name: name
        });
    }

    contains(name) {
        return this.storage.indexOf(name) !== -1;
    }

    clear() {
        this.storage = '#';
        this.details = [];
    }

    findUuid(name) {
        let uuid = null;

        this.details.forEach(person => {
            if (person.name === name) {
                uuid = person.id;
            }
        });

        return uuid;
    }

    get() {
        return this.storage;
    }
}

export default new BrowsingHistoryData();
