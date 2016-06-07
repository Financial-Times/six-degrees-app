import Ajax from '../../models/services/ajax.js';

class ConnectionsData {
    constructor() {

    }

    get() {
        return Ajax.get({
            url: 'https://raw.githubusercontent.com/Financial-Times/public-six-degrees/master/sample/connected-people.json'
        });
    }
}

export default new ConnectionsData();
