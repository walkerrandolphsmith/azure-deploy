var gulp = require('gulp');
var ftp = require('gulp-ftp');
var args = require('yargs').argv;
var FtpClient = require('ftp');

var config = getConfigurationFrom(args);

gulp.task('default', ['clean-remote'], function () {
    gulp.src(config.deployment.files)
        .pipe(ftp({
            host: config.deployment.host,
            user: config.deployment.user,
            password: config.deployment.password,
            remotePath: config.deployment.dest
        }));
});

gulp.task('clean-remote', [], function () {
    var ftpClient = new FtpClient();
    ftpClient.on('ready', function () {
        ftp.rmdir(config.deployment.dest, function(error){
            throw error;
        });
        ftp.end();
    });
    ftpClient.connect({
        host: config.deployment.host,
        user: config.deployment.user,
        password: config.deployment.password
    });
});

function getConfigurationFrom(args) {
    var isNotValid = args.host == null || args.user == null || args.password == null || args.deploymentFiles == null;
    if (isNotValid) {
        throw 'Error: No deployment files were specified';
    }
    var config = {
        deployment: {}
    };
    config.deployment.files = JSON.parse(args.deploymentFiles);
    config.deployment.host = args.host;
    config.deployment.user = args.user;
    config.deployment.password = args.password;
    config.deployment.dest = args.dest || '/site/wwwroot';
    return config;
}
