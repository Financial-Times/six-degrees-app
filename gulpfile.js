(function () {

    const CONFIG = {
        path: {
            buildTasks: 'build/tasks/',
            devClient: 'app/dev/client/',
            devServer: 'app/dev/server/',
            buildClient: 'app/release/client/',
            buildServer: 'app/release/server/'
        }
    };

    require('gulp-task-loader')({
        'dir': CONFIG.path.buildTasks,
        'config': CONFIG
    });

}());
