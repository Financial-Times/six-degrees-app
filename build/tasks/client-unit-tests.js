(function () {

    const Server = require('karma').Server;

    module.exports = function (done) {
        return new Server({
            configFile: __dirname + '/../../test/unit/karma.conf.js',
            singleRun: true
        }, done).start();
    };

}());
