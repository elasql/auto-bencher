/*
  for the maintainability, leave comments beside the try catch blocks
*/
const fs = require('fs');
const logger = require('../logger');
const ShellCmd = require('../shell-cmd-generator');

const { exec } = require('../child-process');

const defaultDirs = ['databases', 'results'];

async function execute (configParams, argv) {
  logger.info('start initializing the environment');

  await checkLocalJdk(configParams);
  await delpoyJdkToAllMachines(configParams);
}

async function checkLocalJdk (configParams) {
  const { jdkPackagePath } = configParams;

  logger.info('checking local jdk: ' + jdkPackagePath);

  // fs.exists (async version) is deprecated
  if (!fs.existsSync(jdkPackagePath)) {
    throw new Error('cannot find the JDK at: ' + jdkPackagePath);
  }
}

async function delpoyJdkToAllMachines (configParams) {
  const { involvedMachines } = configParams;

  /*
  Bad Code

    for (const ip of involvedMachines) {
      deployJdkToMachine(configParams, ip);
    }

  although it is concurrent code as well,
  it doesn't wait all the jobs.

  In other words, if you run the bad code,
  "the environment has been initialized" will be printed before the jobs finish.

  */

  // Good code
  await Promise.all(
    involvedMachines.map(
      ip => deployJdkToMachine(configParams, ip)
    )
  );
}

async function deployJdkToMachine (configParams, ip) {
  logger.info('checking node ' + ip + '...');

  await createWorkingDir(configParams, ip);
  if (!await checkJavaRuntime(configParams, ip)) {
    await sendJdk(configParams, ip);
    await unpackJdk(configParams, ip);
    await removeJdk(configParams, ip);
  }

  const check = 'node ' + ip + ' checked';
  logger.info(check.green);
}

async function createWorkingDir (configParams, ip) {
  const { systemUserName, systemRemoteWorkDir } = configParams;
  const shellCmd = new ShellCmd(systemUserName, ip);

  logger.info('creating a working directory on ' + ip);

  for (const dir of defaultDirs) {
    const mkdir = ShellCmd.getMkdir(
      systemRemoteWorkDir,
      dir
    );
    const ssh = shellCmd.getSsh(mkdir);
    await exec(ssh);
  }
}

async function checkJavaRuntime (configParams, ip) {
  const { systemUserName, systemRemoteWorkDir, jdkDir } = configParams;
  const shellCmd = new ShellCmd(systemUserName, ip);
  const getJavaVersionCmd = ShellCmd.getJavaVersion(systemRemoteWorkDir, jdkDir);
  const ssh = shellCmd.getSsh(getJavaVersionCmd);

  logger.info('checking java runtime on ' + ip);

  // avoid program crash if there is no JavaRunTime
  try {
    await exec(ssh);
  } catch (e) {
    // it is ok to do nothing with this error
    return false;
  }
  return true;
}

async function sendJdk (configParams, ip) {
  const { systemUserName, systemRemoteWorkDir, jdkPackagePath } = configParams;
  const shellCmd = new ShellCmd(systemUserName, ip);
  const scp = shellCmd.getScp(false, jdkPackagePath, systemRemoteWorkDir);

  logger.info('sending JDK to ' + ip);

  await exec(scp);
}

async function unpackJdk (configParams, ip) {
  const { systemUserName, systemRemoteWorkDir, jdkPackageName } = configParams;
  const shellCmd = new ShellCmd(systemUserName, ip);
  const tar = ShellCmd.getTar(systemRemoteWorkDir, jdkPackageName);
  const ssh = shellCmd.getSsh(tar);

  logger.info('unpacking ' + jdkPackageName + ' on ' + ip);

  await exec(ssh);
}

async function removeJdk (configParams, ip) {
  const { systemUserName, systemRemoteWorkDir, jdkPackageName } = configParams;
  const shellCmd = new ShellCmd(systemUserName, ip);
  const rm = ShellCmd.getRm(false, systemRemoteWorkDir, jdkPackageName);
  const ssh = shellCmd.getSsh(rm);

  logger.info('removing ' + jdkPackageName + ' on ' + ip);

  await exec(ssh);
}

module.exports = {
  execute: execute
};
