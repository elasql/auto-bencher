/*
  for the maintainability, leave comments on the try catch blocks
*/
const logger = require('../logger');
const Cmd = require('../ssh/ssh-generator');
const {
  createWorkingDir,
  checkJavaRunTime,
  sendJdk,
  unpackJdk,
  removeJdk
} = require('../actions/remote-actions');

const {
  checkLocalJdk
} = require('../actions/local-actions');

async function execute (configParam) {
  logger.info('start initializing the environment');

  const { jdkPackagePath } = configParam;

  await checkLocalJdk(jdkPackagePath);
  await delpoyJdkToAllMachines(configParam);

  logger.info('the environment has been initialized'.green);
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
        Good:
        1. ip => deployJdkToMachine(configParam, ip)
        2. ip => { return deployJdkToMachine(configParam, ip)}

        Bad (won't await):
        1. ip => { deployJdkToMachine(configParam, ip) }
      */
      ip => deployJdkToMachine(configParam, ip)
    )
  );
}

async function deployJdkToMachine (configParam, ip) {
  logger.info('checking node - ' + ip + '...');

  const cmd = new Cmd(configParam.systemUserName, ip);

  const {
    systemRemoteWorkDir,
    jdkDir,
    jdkPackagePath,
    jdkPackageName
  } = configParam;

  await createWorkingDir(cmd, systemRemoteWorkDir);
  if (!await checkJavaRunTime(cmd, systemRemoteWorkDir, jdkDir)) {
    await sendJdk(cmd, jdkPackagePath, systemRemoteWorkDir);
    await unpackJdk(cmd, systemRemoteWorkDir, jdkPackageName);
    await removeJdk(cmd, systemRemoteWorkDir, jdkPackageName);
  }

  const check = 'node ' + ip + ' checked';
  logger.info(check.green);
}

module.exports = {
  execute: execute
};
