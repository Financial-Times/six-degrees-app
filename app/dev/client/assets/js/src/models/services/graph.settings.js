class GraphSettings {
    constructor() {
        this.mode = true; //false - just browse, true - explore with details
    }

    setMode(mode) {
        this.mode = mode;
    }

    getMode() {
        return this.mode;
    }
}

export default new GraphSettings();
