define('logs', ['jquery', 'moment', 'constants'], function ($, moment, CONSTANTS) {

    let logsObject = {};

    function parseStack(stack) {
        let parsedStack = '';

        if (stack) {
            if (typeof stack === 'string') {
                parsedStack = stack;
            } else {
                stack.forEach(stackLevel => {
                    parsedStack += stackLevel;
                });
            }
        }

        return parsedStack;
    }

    function updateLogs(logs) {
        const entries = [];

        logs.forEach(log => {
            const logEntry = React.createElement('li', {
                key: 'log-entry-' + log.timestamp + Math.random(),
                className: 'log-entry text-muted'
            }, '[' + log.timestamp + '] ' + log.message + parseStack(log.stack));

            entries.push(logEntry);
        });

        return entries;
    }

    function updateLogsContainer(type) {
        const logs = logsObject['file.' + type],
            logsList = React.createElement('ul', {}, updateLogs(logs));
        ReactDOM.render(logsList, document.getElementById('logs-list'));
    }

    function fetchLogs() {
        $.ajax('/api/logs/?from=' + moment().unix() + '&to=' + moment().add(-2, 'minutes').unix(), {
            headers: {
                'Authorization': 'Basic ' + CONSTANTS.API_KEY
            },
            error: function (error) {
                console.warn('error', error);
            }
        }).then(function (response) {
            logsObject = response;
            updateLogsContainer('error');
            $('#logs-loading-indicator').hide();
            $('#reload-logs-btn').show();
        });
    }

    function configureLogsNavigation() {
        $('#logs-nav-tabs a').on('click', function (event) {
            const $target = $(event.target);
            event.preventDefault();
            event.stopPropagation();

            $('#logs-nav-tabs li').removeClass('active');
            $target.parent().addClass('active');

            updateLogsContainer($target.data().level);
        });

        $('#reload-logs-btn').on('click', function () {
            $(this).hide();
            $('#logs-loading-indicator').show();
            fetchLogs();
        });
    }

    (function init() {
        fetchLogs();
        configureLogsNavigation();
    }());

});
