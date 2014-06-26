'use strict';

var gulp = require('gulp');
var tap = require('gulp-tap');
var FtpClient = require('ftp');
var path = require('path');

var config = getConfigurationFrom(process.env);

gulp.task('ftp', [], function () {
    var ftpClient = new FtpClient();
    ftpClient.on('ready', function () {
        gulp.src(config.deployment.files)
            .pipe(tap(function (file, t) {
                var relativePath = path.relative(file.path, '/');
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
    var isNotValid = vars.bamboo_deployment_host == null || vars.bamboo_deployment_user == null || vars.bamboo_deployment_password == null || vars.bamboo_deployment_files == null;
    if (isNotValid) {
        throw 'Error: Not all environment variables have been defined';
    }
    var config = {
        deployment: {}
    };
    config.deployment.files = JSON.parse(vars.bamboo_deployment_files);
    config.deployment.host = vars.bamboo_deployment_host;
    config.deployment.user = vars.bamboo_deployment_user;
    config.deployment.password = vars.bamboo_deployment_password;
    config.deployment.dest = vars.bamboo_deployment_dest || '/site/wwwroot';
    return config;
}
