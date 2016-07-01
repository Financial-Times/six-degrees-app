(function () {
    'use strict';

    const moment = require('moment'),
        storage = {
            people: {},
            connections: {},
            users: {}
        };

    function handle(id) {
        if (!storage[id].start) {
            storage[id].start = moment();
        } else {
            if (moment().isAfter(storage[id].start, 'day')) {
                storage[id] = {};
            }
        }
    }

    module.exports = {
        storage: storage,
        handle: handle
    };

}());
