const fs = require('fs');
const command = require('../command')
const logger = reuqire('../logger');
const Config = require('../config-loader');

const param = {
    jdkPackagePath: Config.getJdkPackagePath(),
    jdkPackageFileName: Config.getJdkPackageFileName(),
    jdkDirName: Config.getJdkDirName(),
    involvedMachines: Config.getInvolvedMachines(),
    systemUserName: Config.getSystemUserName(),
    systemRemoteWorkDir: Config.getSystemRemoteWorkDir(),
}

function execute(argv){
    logger.info("start initializing the environment");
    checkLocalJdk();
    delpoyJdkToAllMachines();
}

function checkLocalJdk(){
    logger.info("checking local jdk: ", param.jdkPackagePath);
    if(!fs.existsSync(param.jdkPackagePath))
        throw new Error("cannot find the JDK at: " + param.jdkPackagePath);
}

function delpoyJdkToAllMachines(){
    param.involvedMachines.forEach(ip => { 
        logger.info("checking node " + ip + "...");
        
        createWorkingDir(ip);
        if(!checkJavaRuntime(ip)){
            sendJdk(ip);
            unpackJdk(ip);
            removeJdkPackage(ip);
        }

        const check = 'node ' + ip + " checked";
        logger.info('\x1b[32m%s\x1b[0m', check);
    });
}

function createWorkingDir(ip){
    logger.info("creating a working directory on " + ip);
    ["databases", "results"].forEach(dir => { 
        command.ssh(param.systemUserName, ip, 'mkdir -p ' + param.systemRemoteWorkDir + '/' + dir);
    });
}

function checkJavaRuntime(ip){
    logger.info("checking java runtime on " + ip);
    return command.ssh(param.systemUserName, ip, param.systemRemoteWorkDir + '/' + param.jdkDirName + '/bin/java -version');
}

function sendJdk(ip){
    logger.info("sending JDK to " + ip);
    command.scp_to(false, param.systemUserName, ip, param.jdkPackagePath, param.systemRemoteWorkDir);
}

function unpackJdk(ip){
    logger.info("unpacking " + param.jdkPackageFileName + " on " + ip);
    command.ssh(param.systemUserName, ip, 'tar -C ' + param.systemRemoteWorkDir + ' -zxf ' + param.systemRemoteWorkDir + '/' + param.jdkPackageFileName);
}

function removeJdkPackage(ip){
    logger.info("removing " + param.jdkPackageFileName + " on " + ip);
    command.ssh(param.systemUserName, ip, 'rm ' + param.systemRemoteWorkDir + '/' + param.jdkPackageFileName);
}

module.exports = {
    execute: execute
};