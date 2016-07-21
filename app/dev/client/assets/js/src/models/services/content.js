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

    updateConnectionsContent(uuid, connectionUuid, content) {
        uuid = this.parseUuid(uuid);
        connectionUuid = this.parseUuid(connectionUuid);
        const currentConnectionsContent = this.connectionsData[uuid] || {};
        currentConnectionsContent[connectionUuid] = content;
        this.connectionsData[uuid] = currentConnectionsContent;
    }

    filter(uuidOne, uuidTwo) {
        uuidOne = this.parseUuid(uuidOne);
        uuidTwo = this.parseUuid(uuidTwo);

        const connectionsContent = this.connectionsData[uuidOne];

        this.filteredData = connectionsContent[uuidTwo] ? connectionsContent[uuidTwo] : [];
    }

    getFiltered() {
        return this.filteredData;
    }

    clearFiltered() {
        this.filteredData = null;
    }
}

export default new Content();
