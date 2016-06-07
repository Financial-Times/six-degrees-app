import {HttpClient, json} from 'aurelia-fetch-client';

class Ajax {

    constructor(http) {
        http.configure(config => {
            config.useStandardConfiguration();
        });
        this.http = http;
        this.json = json;
    }

    get(request) {
        return this.http.fetch(request.url, {
            method: 'get'
        }).then(response => {
            return response.status === 200 ? response.json() : response;
        });
    }

    post(request) {
        const headers = {
            'Accept': 'application/json',
            'X-Requested-With': 'Fetch'
        };
        Object.assign(headers, request.headers);

        return this.http.fetch(request.url, {
            method: 'post',
            headers: headers,
            body: this.json(request.data)
        })
        .then(response => response.json());
    }
}

export default new Ajax(new HttpClient());
