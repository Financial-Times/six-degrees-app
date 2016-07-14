define('utils', function () {

    this.getUrlParameter = function (name) {
        const results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(window.location.href);
        let value = null;

        if (results !== null) {
            value = results[1] || 0;
        }

        return value;
    };

    return this;
});
