var appRoot = 'app/dev/client/assets/js/src/';
var outputRoot = 'app/dev/client/assets/js/dst/';
var exportSrvRoot = 'app/release/client/';

module.exports = {
  root: appRoot,
  source: appRoot + '**/*.js',
  html: appRoot + '**/*.html',
  css: appRoot + '**/*.css',
  sass: 'app/dev/client/assets/sass/**/*.scss',
  style: 'styles/**/*.css',
  output: outputRoot,
  exportSrv: exportSrvRoot
};
