/*
  If you don't know whether it needs to try catch exec,
  then don't try catch !!!
  by Pin-Yu
*/

/*
ssh error code 255 stands for connection failed!!!
*/

const Cmd = require('../ssh/cmd');
const logger = require('../logger');

const { join } = require('../utils');
const { exec } = require('../ssh/ssh-executor');

// loading is 1 and benchmarking is 2
// don't change the order because our benchmarker depends on these two args.
const Action = {
  loading: 1,
  benchmarking: 2
};

const BENCH_DIR = 'benchmarker';
const CHECKING_INTERVAL = 10000; // ms

const defaultDirs = ['databases', 'results'];

// init
async function createWorkingDir (cmd, systemRemoteWorkDir) {
  for (const dir of defaultDirs) {
    const mkdir = Cmd.mkdir(join(systemRemoteWorkDir, dir));
    const ssh = cmd.ssh(mkdir);

    logger.debug(`creating a working directory on - ${cmd.ip}`);

    try {
      await exec(ssh);
    } catch (err) {
      if (err.code === 1) {
        logger.debug(`error occurs on creating a working directory on - ${cmd.ip}`);
      } else {
        throw Error(err.stderr);
      }
    }
  }
}

// init
async function checkJavaRunTime (cmd, systemRemoteWorkDir, jdkDir) {
  const javaVersion = Cmd.javaVersion(systemRemoteWorkDir, jdkDir);
  const ssh = cmd.ssh(javaVersion);

  logger.debug(`checking java runtime on - ${cmd.ip}`);

  try {
    await exec(ssh);
  } catch (e) {
    // doing nothing is OK
    return false;
  }
  return true;
}

// init
async function sendJdk (cmd, jdkPackagePath, systemRemoteWorkDir) {
  const scp = cmd.scp(false, jdkPackagePath, systemRemoteWorkDir);

  logger.debug(`sending JDK to - ${cmd.ip}`);

  // do NOT handle this execution, let it crash if error occurs
  await exec(scp);
}

// init
async function unpackJdk (cmd, systemRemoteWorkDir, jdkPackageName) {
  const tar = Cmd.tar(systemRemoteWorkDir, jdkPackageName);
  const ssh = cmd.ssh(tar);

  logger.debug(`unpacking ${jdkPackageName} on - ${cmd.ip}`);

  // do NOT handle this execution, let it crash if error occurs
  await exec(ssh);
}

// init
async function removeJdk (cmd, systemRemoteWorkDir, jdkPackageName) {
  const rm = Cmd.rm(false, join(systemRemoteWorkDir, jdkPackageName));
  const ssh = cmd.ssh(rm);

  logger.debug(`removing ${jdkPackageName} on - ${cmd.ip}`);

  // do NOT handle this execution, let it crash if error occurs
  await exec(ssh);
}

// await delay(1000) means wait 1 second
const delay = (interval) => {
  logger.debug(`delay ${interval} ms`);
  return new Promise(resolve => setTimeout(resolve, interval));
};

async function sendDir (cmd, localPath, remoteWorkDir, remoteInfo) {
  const { prefix, id, ip } = remoteInfo;
  const scp = cmd.scp(true, localPath, remoteWorkDir);

  logger.debug(`sendDir - ${prefix} ${id} ${ip} command - ${scp}`);
  // don't try catch here
  // let it error
  await exec(scp);
}

async function copyDir (cmd, srcDir, destDir, remoteInfo) {
  const { prefix, id, ip } = remoteInfo;
  const cp = Cmd.cp(true, srcDir, destDir);
  const ssh = cmd.ssh(cp);

  logger.debug(`copyDir - ${prefix} ${id} ${ip} command - ${ssh}`);

  await exec(ssh);
}

async function deleteDir (cmd, dir, remoteInfo) {
  const { prefix, id, ip } = remoteInfo;
  const rm = Cmd.rm(true, dir);
  const ssh = cmd.ssh(rm);

  logger.debug(`deleteDir - ${prefix} ${id} ${ip} command - ${ssh}`);

  try {
    await exec(ssh);
  } catch (err) {
    if (err.code === 1) {
      logger.debug(`${dir} is not found on ${prefix} ${id} ${ip}`);
    } else {
      throw Error(err.stderr);
    }
  }
}

async function killBenchmarker (cmd) {
  const kill = Cmd.killBenchmarker();
  const ssh = cmd.ssh(kill);

  logger.debug(`kill benchmarker - ${cmd.ip} command - ${ssh}`);

  try {
    await exec(ssh);
  } catch (err) {
    if (err.code === 1) {
      // don't do anything because there may be no running process
      return;
    }
    logger.debug(err.stderr);
  }
}

async function runJar (cmd, progArgs, javaBin, vmArgs, jarPath, logPath, remoteInfo) {
  const { prefix, id, ip } = remoteInfo;
  const runJar = Cmd.runJar(
    javaBin,
    vmArgs,
    jarPath,
    progArgs,
    logPath
  );

  const ssh = cmd.ssh(runJar);

  logger.debug(`runJar on ${prefix} ${id} ${ip} command - ${ssh}`);

  // don't try catch this execution
  // let outer function handle
  await exec(ssh);
}

async function grepCsvFileName (cmd, resultDir, remoteInfo) {
  const { prefix, id, ip } = remoteInfo;
  const grepCsv = Cmd.grepCsv(resultDir, id);
  const ssh = cmd.ssh(grepCsv);

  logger.debug(`grep csv file name on ${prefix} ${id} ${ip} command - ${ssh}`);

  const result = await exec(ssh);
  return result;
}

async function pullFile (cmd, remotePath, dest, remoteInfo) {
  const { prefix, id, ip } = remoteInfo;
  const scp = cmd.scp(false, dest, remotePath, true);

  logger.debug(`pull file from ${prefix} ${id} ${ip} command - ${scp}`);

  await exec(scp);
}

async function getTotalThroughput (cmd, resultDir, remoteInfo) {
  const { prefix, id, ip } = remoteInfo;
  const grepTotal = Cmd.grepTotal(resultDir, id);
  const ssh = cmd.ssh(grepTotal);

  logger.debug(`get total throughput on ${prefix} ${id} ${ip} command - ${ssh}`);

  const result = await exec(ssh);
  return result;
}

async function grepLog (cmd, keyword, logPath, remoteInfo) {
  const { prefix, id, ip } = remoteInfo;
  const grep = Cmd.grep(keyword, logPath);
  const ssh = cmd.ssh(grep);

  logger.debug(`grep log on ${prefix} ${id} ${ip} command - ${ssh}`);

  // don't try catch here, let outer functions to handle
  // please return the result.
  const result = await exec(ssh);
  return result;
}

async function runSSH (cmd, cmdStr, remoteInfo) {
  const { prefix, id, ip } = remoteInfo;
  const ssh = cmd.ssh(cmdStr);

  logger.debug(`run ssh on ${prefix} ${id} ${ip} command - ${ssh}`);

  try {
    await exec(ssh);
  } catch (err) {
    logger.info(err);
    throw Error(err.stderr);
  }
}

module.exports = {
  Action,
  BENCH_DIR,
  CHECKING_INTERVAL,
  createWorkingDir,
  checkJavaRunTime,
  sendJdk,
  unpackJdk,
  removeJdk,
  delay,
  sendDir,
  copyDir,
  deleteDir,
  killBenchmarker,
  runJar,
  grepCsvFileName,
  pullFile,
  getTotalThroughput,
  grepLog,
  runSSH
};
