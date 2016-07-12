class GraphSettings {
    constructor() {
        this.mode = true; //false - just browse, true - explore with details
        this.shareLinkState = false;
    }

    setMode(mode) {
        this.mode = mode;
    }

    getMode() {
        return this.mode;
    }

    toggleShareLinkState() {
        this.shareLinkState = !this.shareLinkState;
    }
}

export default new GraphSettings();
