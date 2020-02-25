const fs = require('fs');
const command = require('../command');
const logger = require('../logger');

function execute (params, argv) {
  logger.info('start initializing the environment');

  checkLocalJdk(params);
  delpoyJdkToAllMachines(params);
}

function checkLocalJdk (params) {
  const { jdkPackagePath } = params;
  logger.info('checking local jdk: ', jdkPackagePath);
  if (!fs.existsSync(jdkPackagePath)) { throw new Error('cannot find the JDK at: ' + jdkPackagePath); }
}

function delpoyJdkToAllMachines (params) {
  const { involvedMachines } = params;

  involvedMachines.forEach(ip => {
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
  const { systemUserName, systemRemoteWorkDir } = params;
  logger.info('creating a working directory on ' + ip);

  ['databases', 'results'].forEach(dir => {
    command.ssh(systemUserName, ip, 'mkdir -p ' + systemRemoteWorkDir + '/' + dir);
  });
}

function checkJavaRuntime (params, ip) {
  const { systemUserName, systemRemoteWorkDir, jdkDirName } = params;
  logger.info('checking java runtime on ' + ip);
  return command.ssh(systemUserName, ip, systemRemoteWorkDir + '/' + jdkDirName + '/bin/java -version');
}

function sendJdk (params, ip) {
  const { systemUserName, systemRemoteWorkDir, jdkPackagePath } = params;
  logger.info('sending JDK to ' + ip);
  command.scp_to(false, systemUserName, ip, jdkPackagePath, systemRemoteWorkDir);
}

function unpackJdk (params, ip) {
  const { systemUserName, systemRemoteWorkDir, jdkPackageFileName } = params;
  logger.info('unpacking ' + jdkPackageFileName + ' on ' + ip);
  command.ssh(systemUserName, ip, 'tar -C ' + systemRemoteWorkDir + ' -zxf ' + systemRemoteWorkDir + '/' + jdkPackageFileName);
}

function removeJdkPackage (params, ip) {
  const { systemUserName, systemRemoteWorkDir, jdkPackageFileName } = params;
  logger.info('removing ' + jdkPackageFileName + ' on ' + ip);
  command.ssh(systemUserName, ip, 'rm ' + systemRemoteWorkDir + '/' + jdkPackageFileName);
}

module.exports = {
  execute: execute
};
