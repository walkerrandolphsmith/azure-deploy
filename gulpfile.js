'use strict';

var gulp = require('gulp');
var tap = require('gulp-tap');
var FtpClient = require('jsftp');
var path = require('path');
var q = require('q');
var ftp = require('gulp-ftp');

var config;
var ftpClient;

gulp.task('ftp', ['ftp-upload-site'], function () {
//    ftpClient.raw.quit(function (ftpError, data) {
//        processError(ftpError);
//    })
});

gulp.task('ftp-connect', [], function () {
    config = getFtpConfigurationFrom(process.env);
    ftpClient = new FtpClient({
        host: config.deployment.host,
        user: config.deployment.user,
        pass: config.deployment.password,
        debugMode: config.deployment.ftpDebug
    });
    ftpClient.on('jsftp_debug', function (eventType, data) {
        console.log('DEBUG: ', eventType);
        console.log(JSON.stringify(data, null, 2));
    });
});

gulp.task('ftp-upload-site', [], function () {
    config = getFtpConfigurationFrom(process.env);
    return gulp.src(config.deployment.files)
        .pipe(ftp({
            user: config.deployment.user,
            pass: config.deployment.password,
            host: config.deployment.host,
            remotePath: config.deployment.dest
        }));
});

gulp.task('ftp-reset-site', ['ftp-connect'], function () {
    var deferSiteReset = q.defer();
    ftpClient.raw.cwd(config.deployment.dest, function (ftpError) {
        processError(ftpError);
    });
    ftpClient.ls(config.deployment.dest, function (error, results) {
        processError(error);
        console.log(results);
        deferSiteReset.resolve();
    });
    return deferSiteReset.promise;
});

function getFtpConfigurationFrom(vars) {
    var config = {deployment: {}};
    config.deployment.files = JSON.parse(vars.bamboo_deployment_files);
    config.deployment.host = vars.bamboo_deployment_host;
    config.deployment.user = vars.bamboo_deployment_user;
    config.deployment.password = vars.bamboo_deployment_password;
    config.deployment.dest = vars.bamboo_deployment_dest || '/site/wwwroot';
    config.deployment.ftpDebug = false;
    return config;
}

function processError(error) {
    if (error) {
        throw error;
    }
}
