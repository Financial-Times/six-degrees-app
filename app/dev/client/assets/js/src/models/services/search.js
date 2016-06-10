import Ajax from '../../models/services/ajax.js';

class Search {

    findPeople(params) {
        return Ajax.get({
            url: 'api/search/' + params.queryString + '*'
        });
    }

    findPerson(params) {
        return Ajax.get({
            url: 'api/search/' + params.queryString
        });
    }

    lookUpPersonByUuid(params) {
        return Ajax.get({
            url: 'api/lookup/' + params.uuid
        });
    }

}

export default new Search();
