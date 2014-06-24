var gulp = require('gulp');
var ftp = require('gulp-ftp');
var args = require('yargs').argv;

gulp.task('default', [], function () {
    var config = getConfigurationFrom(args);
    if (config.isNotValid()) {
        throw 'Error: No deployment files were specified';
    }
    gulp.src(config.deployment.files)
        .pipe(ftp({
            host: config.deployment.host,
            user: config.deployment.user,
            password: config.deployment.password,
            remotePath: config.deployment.dest
        }));
});

function getConfigurationFrom(args) {
    var isNotValid = args.host == null || args.user == null || args.password == null || args.deploymentFiles == null;
    if (isNotValid){
        throw 'Error: No deployment files were specified';
    }
    var config = {
        deployment: {}
    };
    config.deployment.files = JSON.parse(args.deploymentFiles);
    config.deployment.host = args.host;
    config.deployment.user = args.user;
    config.deployment.password = args.password;
    config.deployment.dest = args.dest || 'wwwroot';
    return config;
}