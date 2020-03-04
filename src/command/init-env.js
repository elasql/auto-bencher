/*
  for the maintainability, leave comments beside the try catch blocks
*/
const fs = require('fs');
const logger = require('../logger');
const ShellCmd = require('../shell-cmd-generator');

const { exec } = require('../child-process');

const defaultDirs = ['databases', 'results'];

async function execute (params, argv) {
  logger.info('start initializing the environment');

  await checkLocalJdk(params);
  await delpoyJdkToAllMachines(params);
}

async function checkLocalJdk (params) {
  const { jdkPackagePath } = params;

  logger.info('checking local jdk: ' + jdkPackagePath);

  // fs.exists (async version) is deprecated
  if (!fs.existsSync(jdkPackagePath)) {
    throw new Error('cannot find the JDK at: ' + jdkPackagePath);
  }
}

async function delpoyJdkToAllMachines (params) {
  const { involvedMachines } = params;

  /*
  Bad Code

    for (const ip of involvedMachines) {
      deployJdkToMachine(params, ip);
    }

  although it is concurrent code as well,
  it doesn't wait all the jobs.

  In other words, if you run the bad code,
  "the environment has been initialized" will be printed before the jobs finish.

  */

  // Good code
  await Promise.all(
    involvedMachines.map(
      ip => deployJdkToMachine(params, ip)
    )
  );
}

async function deployJdkToMachine (params, ip) {
  logger.info('checking node ' + ip + '...');

  await createWorkingDir(params, ip);
  if (!await checkJavaRuntime(params, ip)) {
    await sendJdk(params, ip);
    await unpackJdk(params, ip);
    await removeJdk(params, ip);
  }

  const check = 'node ' + ip + ' checked';
  logger.info(check.green);
}

async function createWorkingDir (params, ip) {
  const { systemUserName, systemRemoteWorkDir } = params;
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

async function checkJavaRuntime (params, ip) {
  const { systemUserName, systemRemoteWorkDir, jdkDir } = params;
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

async function sendJdk (params, ip) {
  const { systemUserName, systemRemoteWorkDir, jdkPackagePath } = params;
  const shellCmd = new ShellCmd(systemUserName, ip);
  const scp = shellCmd.getScp(false, jdkPackagePath, systemRemoteWorkDir);

  logger.info('sending JDK to ' + ip);

  await exec(scp);
}

async function unpackJdk (params, ip) {
  const { systemUserName, systemRemoteWorkDir, jdkPackageName } = params;
  const shellCmd = new ShellCmd(systemUserName, ip);
  const tar = ShellCmd.getTar(systemRemoteWorkDir, jdkPackageName);
  const ssh = shellCmd.getSsh(tar);

  logger.info('unpacking ' + jdkPackageName + ' on ' + ip);

  await exec(ssh);
}

async function removeJdk (params, ip) {
  const { systemUserName, systemRemoteWorkDir, jdkPackageName } = params;
  const shellCmd = new ShellCmd(systemUserName, ip);
  const rm = ShellCmd.getRm(false, systemRemoteWorkDir, jdkPackageName);
  const ssh = shellCmd.getSsh(rm);

  logger.info('removing ' + jdkPackageName + ' on ' + ip);

  await exec(ssh);
}

module.exports = {
  execute: execute
};
