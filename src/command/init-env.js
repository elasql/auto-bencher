/*
  for the maintainability, leave comments on the try catch blocks
*/
const fs = require('fs');
const logger = require('../logger');
const ShellCmd = require('../shell-cmd');

const { exec } = require('../child-process');

const defaultDirs = ['databases', 'results'];

async function execute (configParam) {
  logger.info('start initializing the environment');

  await checkLocalJdk(configParam);
  await delpoyJdkToAllMachines(configParam);

  logger.info('the environment has been initialized'.green);
}

async function checkLocalJdk (configParam) {
  const { jdkPackagePath } = configParam;

  logger.info('checking local jdk: ' + jdkPackagePath);

  // fs.exists (async version) is deprecated
  if (!fs.existsSync(jdkPackagePath)) {
    throw new Error('cannot find the JDK at: ' + jdkPackagePath);
  }
}

async function delpoyJdkToAllMachines (configParam) {
  const { involvedMachines } = configParam;

  /*
  Bad Code

    for (const ip of involvedMachines) {
      await deployJdkToMachine(configParam, ip);
    }

    it won't run in concurrency
  */

  // Good code
  await Promise.all(
    involvedMachines.map(
      /*
        either ip => deployJdkToMachine(configParam, ip)
        or ip => { return deployJdkToMachine(configParam, ip)} is OK

        ip => { deployJdkToMachine(configParam, ip) } won't await
      */
      ip => deployJdkToMachine(configParam, ip)
    )
  );
}

async function deployJdkToMachine (configParam, ip) {
  logger.info('checking node ' + ip + '...');

  await createWorkingDir(configParam, ip);
  if (!await checkJavaRuntime(configParam, ip)) {
    await sendJdk(configParam, ip);
    await unpackJdk(configParam, ip);
    await removeJdk(configParam, ip);
  }

  const check = 'node ' + ip + ' checked';
  logger.info(check.green);
}

async function createWorkingDir (configParam, ip) {
  const { systemUserName, systemRemoteWorkDir } = configParam;
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

async function checkJavaRuntime (configParam, ip) {
  const { systemUserName, systemRemoteWorkDir, jdkDir } = configParam;
  const shellCmd = new ShellCmd(systemUserName, ip);
  const javaVersion = ShellCmd.getJavaVersion(systemRemoteWorkDir, jdkDir);
  const ssh = shellCmd.getSsh(javaVersion);

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

async function sendJdk (configParam, ip) {
  const { systemUserName, systemRemoteWorkDir, jdkPackagePath } = configParam;
  const shellCmd = new ShellCmd(systemUserName, ip);
  const scp = shellCmd.getScp(false, jdkPackagePath, systemRemoteWorkDir);

  logger.info('sending JDK to ' + ip);

  await exec(scp);
}

async function unpackJdk (configParam, ip) {
  const { systemUserName, systemRemoteWorkDir, jdkPackageName } = configParam;
  const shellCmd = new ShellCmd(systemUserName, ip);
  const tar = ShellCmd.getTar(systemRemoteWorkDir, jdkPackageName);
  const ssh = shellCmd.getSsh(tar);

  logger.info('unpacking ' + jdkPackageName + ' on ' + ip);

  await exec(ssh);
}

async function removeJdk (configParam, ip) {
  const { systemUserName, systemRemoteWorkDir, jdkPackageName } = configParam;
  const shellCmd = new ShellCmd(systemUserName, ip);
  const rm = ShellCmd.getRm(false, systemRemoteWorkDir, jdkPackageName);
  const ssh = shellCmd.getSsh(rm);

  logger.info('removing ' + jdkPackageName + ' on ' + ip);

  await exec(ssh);
}

module.exports = {
  execute: execute
};
