define('constants', ['utils'], function (Utils) {

    return {
        API_KEY: Utils.getUrlParameter('apiKey')
    };

});
