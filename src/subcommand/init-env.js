/*
  for the maintainability, leave comments beside the try catch blocks
*/
const fs = require('fs');
const logger = require('../logger');
const ShellCmdGenerator = require('../shell-cmd-generator');

/* Reference:
 https://nodejs.org/api/child_process.html#child_process_child_process_exec_command_options_callback
*/
const util = require('util');
const exec = util.promisify(require('child_process').exec);

const defaultDirs = ['databases', 'results'];

async function execute (params, argv) {
  logger.info('start initializing the environment');

  await checkLocalJdk(params);
  delpoyJdkToAllMachines(params);
}

async function checkLocalJdk (params) {
  const { jdkPackagePath } = params;

  logger.info('checking local jdk: ' + jdkPackagePath);

  // fs.exists (async version) is deprecated
  if (!fs.existsSync(jdkPackagePath)) {
    throw new Error('cannot find the JDK at: ' + jdkPackagePath);
  }
}

function delpoyJdkToAllMachines (params) {
  const { involvedMachines } = params;

  for (const ip of involvedMachines) {
    deployJdkToMachine(params, ip);
  }
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
  const cmdGen = new ShellCmdGenerator(systemUserName, ip);

  logger.info('creating a working directory on ' + ip);

  for (const dir of defaultDirs) {
    const remoteCmd = ShellCmdGenerator.getMkdir(
      systemRemoteWorkDir,
      dir
    );
    await exec(cmdGen.getSsh(remoteCmd));
  }
}

async function checkJavaRuntime (params, ip) {
  const { systemUserName, systemRemoteWorkDir, jdkDir } = params;
  const cmdGen = new ShellCmdGenerator(systemUserName, ip);
  const remoteCmd = ShellCmdGenerator.getJavaVersion(systemRemoteWorkDir, jdkDir);

  logger.info('checking java runtime on ' + ip);

  // avoid program crash if there is no JavaRunTime
  try {
    await exec(cmdGen.getSsh(remoteCmd));
  } catch (e) {
    // it is ok to do nothing with this error
    return false;
  }
  return true;
}

async function sendJdk (params, ip) {
  const { systemUserName, systemRemoteWorkDir, jdkPackagePath } = params;
  const cmdGen = new ShellCmdGenerator(systemUserName, ip);

  logger.info('sending JDK to ' + ip);

  await exec(cmdGen.getScp(false, jdkPackagePath, systemRemoteWorkDir));
}

async function unpackJdk (params, ip) {
  const { systemUserName, systemRemoteWorkDir, jdkPackageName } = params;
  const cmdGen = new ShellCmdGenerator(systemUserName, ip);
  const remoteCmd = ShellCmdGenerator.getTar(systemRemoteWorkDir, jdkPackageName);

  logger.info('unpacking ' + jdkPackageName + ' on ' + ip);

  await exec(cmdGen.getSsh(remoteCmd));
}

async function removeJdk (params, ip) {
  const { systemUserName, systemRemoteWorkDir, jdkPackageName } = params;
  const cmdGen = new ShellCmdGenerator(systemUserName, ip);
  const remoteCmd = ShellCmdGenerator.getRm(systemRemoteWorkDir, jdkPackageName);

  logger.info('removing ' + jdkPackageName + ' on ' + ip);

  await exec(cmdGen.getSsh(remoteCmd));
}

module.exports = {
  execute: execute
};
