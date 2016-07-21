class Content {
    constructor() {
        this.data = [];
        this.connectionsData = {};
        this.filteredData = {};
    }

    parseUuid(uuid) {
        return uuid.replace('http://api.ft.com/things/', '');
    }

    update(data) {
        this.data = data;
    }

    get() {
        return this.data;
    }

    createConnectionsCache(uuid) {
        uuid = this.parseUuid(uuid);
        if (!this.connectionsData[uuid]) {
            this.connectionsData[uuid] = {};
        }
    }

    updateConnectionsContent(uuid, connectionUuid, content) {
        uuid = this.parseUuid(uuid);
        connectionUuid = this.parseUuid(connectionUuid);
        this.connectionsData[uuid][connectionUuid] = content;
    }

    filter(uuidOne, uuidTwo) {
        uuidOne = this.parseUuid(uuidOne);
        uuidTwo = this.parseUuid(uuidTwo);

        let connectionsContent = this.connectionsData[uuidOne];

        this.filteredData = connectionsContent[uuidTwo] ? connectionsContent[uuidTwo] : [];

        if (!this.filteredData.length && this.connectionsData[uuidTwo]) {
            connectionsContent = this.connectionsData[uuidTwo];
            this.filteredData = connectionsContent[uuidOne] ? connectionsContent[uuidOne] : [];
        }
    }

    getFiltered() {
        return this.filteredData;
    }

    clearFiltered() {
        this.filteredData = null;
    }
}

export default new Content();
