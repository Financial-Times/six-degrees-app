class Content {
    constructor() {
        this.data = [];
    }

    update(data) {
        this.data = data;
    }

    get() {
        return this.data;
    }
}

export default new Content();
