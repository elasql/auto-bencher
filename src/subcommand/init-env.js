const fs = require('fs');
const command = require('../command');
const logger = require('../logger');

function execute (params, argv) {
  logger.info('start initializing the environment');

  checkLocalJdk(params);
  delpoyJdkToAllMachines(params);
}

function checkLocalJdk (params) {
  logger.info('checking local jdk: ', params.jdkPackagePath);
  if (!fs.existsSync(params.jdkPackagePath)) { throw new Error('cannot find the JDK at: ' + params.jdkPackagePath); }
}

function delpoyJdkToAllMachines (params) {
  params.involvedMachines.forEach(ip => {
    logger.info('checking node ' + ip + '...');

    createWorkingDir(ip);
    if (!checkJavaRuntime(ip)) {
      sendJdk(ip);
      unpackJdk(ip);
      removeJdkPackage(ip);
    }

    const check = 'node ' + ip + ' checked';
    logger.info('\x1b[32m%s\x1b[0m', check);
  });
}

function createWorkingDir (params, ip) {
  logger.info('creating a working directory on ' + ip);
  ['databases', 'results'].forEach(dir => {
    command.ssh(params.systemUserName, ip, 'mkdir -p ' + params.systemRemoteWorkDir + '/' + dir);
  });
}

function checkJavaRuntime (params, ip) {
  logger.info('checking java runtime on ' + ip);
  return command.ssh(params.systemUserName, ip, params.systemRemoteWorkDir + '/' + params.jdkDirName + '/bin/java -version');
}

function sendJdk (params, ip) {
  logger.info('sending JDK to ' + ip);
  command.scp_to(false, params.systemUserName, ip, params.jdkPackagePath, params.systemRemoteWorkDir);
}

function unpackJdk (params, ip) {
  logger.info('unpacking ' + params.jdkPackageFileName + ' on ' + ip);
  command.ssh(params.systemUserName, ip, 'tar -C ' + params.systemRemoteWorkDir + ' -zxf ' + params.systemRemoteWorkDir + '/' + params.jdkPackageFileName);
}

function removeJdkPackage (params, ip) {
  logger.info('removing ' + params.jdkPackageFileName + ' on ' + ip);
  command.ssh(params.systemUserName, ip, 'rm ' + params.systemRemoteWorkDir + '/' + params.jdkPackageFileName);
}

module.exports = {
  execute: execute
};
