import Ajax from '../../models/services/ajax.js';
import Cookies from '../../models/services/cookies.js';

class UserData {
    constructor() {
        this.uuid = window.sessionStorage.getItem('user-uuid');
    }

    setUuid(uuid) {
        this.uuid = uuid;
    }

    obtainUuid(callback) {
        Ajax.get({
            url: '/api/uuid/' + Cookies.read('FTSession')
        }).then(userData => {
            console.warn('uuid data by session', userData);
        });
    }

    getUserDetails() {
        const cookieDetails = Cookies.read('FT_User'),
            cookieRows = cookieDetails.split(':'),
            cookieData = {};

        cookieRows.forEach(row => {
            const rowParsed = row.split('=');
            cookieData[rowParsed[0].toLowerCase()] = rowParsed[1];
        });
        this.details = cookieData;

        return this.details;
    }

    authorize() {
        Ajax.get({
            url: '/api/authorize/',
            headers: {
                'X-Api-Key': this.uuid
            }
        }).then(response => {
            console.warn('res', response);
        });
    }

}

export default new UserData();
