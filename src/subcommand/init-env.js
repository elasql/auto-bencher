const fs = require('fs');
const execSync = require('child_process').execSync;
const command = require('../command');
const logger = require('../logger');
const ShellCmdGenerator = require('../shell-cmd-generator');

const defaultDirs = ['databases', 'results'];

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
      removeJdk(ip);
    }

    const check = 'node ' + ip + ' checked';
    logger.info('\x1b[32m%s\x1b[0m', check);
  });
}

function createWorkingDir (params, ip) {
  const { systemUserName, systemRemoteWorkDir } = params;
  const cmdGen = new ShellCmdGenerator(systemUserName, ip);

  logger.info('creating a working directory on ' + ip);

  defaultDirs.forEach(dir => {
    const remoteCmd = ShellCmdGenerator.getMkdir(
      systemRemoteWorkDir,
      dir
    );
    execSync(cmdGen.getSshCmd(remoteCmd));
  });
}

function checkJavaRuntime (params, ip) {
  const { systemUserName, systemRemoteWorkDir, jdkDir } = params;
  const cmdGen = new ShellCmdGenerator(systemUserName, ip);
  const remoteCmd = ShellCmdGenerator.getJavaVersion(systemRemoteWorkDir, jdkDir);

  logger.info('checking java runtime on ' + ip);

  try {
    execSync(cmdGen.getSsh(remoteCmd));
  } catch (e) {
    // it is ok to not handle the error
    return false;
  }
  return true;
}

function sendJdk (params, ip) {
  const { systemUserName, systemRemoteWorkDir, jdkPackagePath } = params;
  const cmdGen = new ShellCmdGenerator(systemUserName, ip);

  logger.info('sending JDK to ' + ip);

  execSync(cmdGen.getScp(false, jdkPackagePath, systemRemoteWorkDir));
}

function unpackJdk (params, ip) {
  const { systemUserName, systemRemoteWorkDir, jdkPackageName } = params;
  const cmdGen = new ShellCmdGenerator(systemUserName, ip);
  const remoteCmd = ShellCmdGenerator.getTar(systemRemoteWorkDir, jdkPackageName);

  logger.info('unpacking ' + jdkPackageName + ' on ' + ip);

  execSync(cmdGen.getSsh(remoteCmd));
}

function removeJdk (params, ip) {
  const { systemUserName, systemRemoteWorkDir, jdkPackageName } = params;
  const cmdGen = new ShellCmdGenerator(systemUserName, ip);
  const remoteCmd = ShellCmdGenerator.getRm(systemRemoteWorkDir, jdkPackageName);

  logger.info('removing ' + jdkPackageName + ' on ' + ip);

  execSync(cmdGen.getSsh(remoteCmd));
}

module.exports = {
  execute: execute
};
