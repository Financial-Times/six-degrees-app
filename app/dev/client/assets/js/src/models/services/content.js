class Content {
    constructor() {
        this.data = [];
    }

    update(data) {
        this.data = data;
    }

    filter(data) {
        this.filteredData = data;
    }

    get() {
        return this.data;
    }

    getFiltered() {
        return this.filteredData;
    }
}

export default new Content();
