define('health', ['jquery', 'constants'], function ($, CONSTANTS) {

    const endpoints = {
        'people': {
            label: 'FT People API',
            status: 0
        },
        'content': {
            label: 'FT Content API',
            status: 0
        },
        'enriched_content': {
            label: 'FT Enriched Content API',
            status: 0
        },
        'elastic_search': {
            label: 'FT Elastic Search API',
            status: 0
        },
        'six_degrees': {
            label: 'FT Six Degrees API',
            status: 0
        },
        'sessions': {
            label: 'FT Sessions API',
            status: 0
        },
        'recommendations': {
            label: 'FT Recommendations API',
            status: 0
        }
    };

    function updateServiceItems() {
        const serviceItems = [];
        let id;

        for (id in endpoints) {
            if (endpoints.hasOwnProperty(id)) {
                const serviceLabel = React.createElement('span', {
                        className: 'text-shadow'
                    }, endpoints[id].label),
                    serviceItem = React.createElement('div', {
                        key: 'service-item-' + id,
                        className: 'service-item alert ' + (endpoints[id].status ? 'alert-success' : 'alert-danger')
                    }, serviceLabel);
                serviceItems.push(serviceItem);
            }
        }

        return serviceItems;
    }

    function updateBoard() {
        const statusBoard = React.createElement('div', {}, updateServiceItems());
        ReactDOM.render(statusBoard, document.getElementById('status-board'));
    }

    function updateStatus(id, result) {
        endpoints[id].status = result;
        updateBoard();
    }

    function check(id) {
        $.ajax('/api/monitor/' + id, {
            headers: {
                'Authorization': 'Basic ' + CONSTANTS.API_KEY
            },
            success: function () {
                updateStatus(id, 1);
            },
            error: function () {
                updateStatus(id, 0);
            }
        });
    }

    function sendRequests() {
        if (CONSTANTS.API_KEY) {
            for (const id in endpoints) {
                if (endpoints.hasOwnProperty(id)) {
                    check(id);
                }
            }
        }
    }

    (function init() {
        updateBoard();
        sendRequests();
        window.setInterval(sendRequests, 10000);
    }());

});
