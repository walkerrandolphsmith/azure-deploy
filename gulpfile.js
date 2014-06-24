'use strict';

var gulp = require('gulp');
var tap = require('gulp-tap');
var FtpClient = require('ftp');

var config = getConfigurationFrom(process.env);

gulp.task('ftp', [], function () {
    var ftpClient = new FtpClient();
    ftpClient.on('ready', function () {
        gulp.src(config.deployment.files)
            .pipe(tap(function (file, t) {
                var relativePath = path.relativeTo(file, '/');
                var publishFile = relativePath + file.path;
                ftpClient.put(publishFile, publishFile, function (ftpError) {
                    if (ftpError) {
                        throw ftpError;
                    }
                });
            }));
        ftpClient.end();
    });
    ftpClient.connect({
        host: config.deployment.host,
        user: config.deployment.user,
        password: config.deployment.password,
        debug: console.log
    });
});

function getConfigurationFrom(vars) {
    var isNotValid = vars.BAMBOO_DEPLOYMENT_HOST == null || vars.BAMBOO_DEPLOYMENT_USER == null || vars.BAMBOO_DEPLOYMENT_PASSWORD == null || vars.BAMBOO_DEPLOYMENT_FILES == null;
    if (isNotValid) {
        throw 'Error: Not all environment variables have been defined';
    }
    var config = {
        deployment: {}
    };
    config.deployment.files = JSON.parse(vars.BAMBOO_DEPLOYMENT_FILES);
    config.deployment.host = vars.BAMBOO_DEPLOYMENT_HOST;
    config.deployment.user = vars.BAMBOO_DEPLOYMENT_USER;
    config.deployment.password = vars.BAMBOO_DEPLOYMENT_PASSWORD;
    config.deployment.dest = vars.BAMBOO_DEPLOYMENT_DEST || '/site/wwwroot';
    return config;
}
