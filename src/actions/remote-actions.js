const Cmd = require('../ssh/cmd');
const { exec } = require('../ssh/ssh-executor');
const logger = require('../logger');
const path = require('path');
const join = path.posix.join;

// loading is 1 and benchmarking is 2
// don't change the order because our benchmarker depended on these two args.
const Action = {
  loading: 1,
  benchmarking: 2
};

const BENCH_DIR = 'benchmarker';
const CHECKING_INTERVAL = 1000;

const defaultDirs = ['databases', 'results'];

// init
async function createWorkingDir (cmd, systemRemoteWorkDir) {
  for (const dir of defaultDirs) {
    const mkdir = Cmd.mkdir(join(systemRemoteWorkDir, dir));
    const ssh = cmd.ssh(mkdir);

    logger.info(`creating a working directory on - ${cmd.ip}`);

    try {
      await exec(ssh);
    } catch (err) {
      if (err.code === 1) {
        logger.info(`error occurs on creating a working directory on - ${cmd.ip}`);
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

  logger.info(`checking java runtime on - ${cmd.ip}`);

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

  logger.info(`sending JDK to - ${cmd.ip}`);

  // do NOT handle this execution, let it crash if error occurs
  await exec(scp);
}

// init
async function unpackJdk (cmd, systemRemoteWorkDir, jdkPackageName) {
  const tar = Cmd.tar(systemRemoteWorkDir, jdkPackageName);
  const ssh = cmd.ssh(tar);

  logger.info(`unpacking ${jdkPackageName} on - ${cmd.ip}`);

  // do NOT handle this execution, let it crash if error occurs
  await exec(ssh);
}

// init
async function removeJdk (cmd, systemRemoteWorkDir, jdkPackageName) {
  const rm = Cmd.rm(false, join(systemRemoteWorkDir, jdkPackageName));
  const ssh = cmd.ssh(rm);

  logger.info(`removing ${jdkPackageName} on - ${cmd.ip}`);

  // do NOT handle this execution, let it crash if error occurs
  await exec(ssh);
}

const delay = (interval) => {
  logger.debug(`delay ${interval} ms`);
  return new Promise(resolve => setTimeout(resolve, interval));
};

async function sendDir (cmd, localPath, remoteWorkDir, remoteInfo) {
  const { prefix, id, ip } = remoteInfo;
  const scp = cmd.scp(true, localPath, remoteWorkDir);

  logger.info(`sendDir - ${prefix} ${id} ${ip} command - ${scp}`);
  // don't try catch here
  // let it error
  await exec(scp);
}

async function copyDir (cmd, srcDir, destDir, remoteInfo) {
  const { prefix, id, ip } = remoteInfo;
  const cp = Cmd.cp(true, srcDir, destDir);
  const ssh = this.cmd.ssh(cp);

  logger.info(`copyDir - ${prefix} ${id} ${ip} command - ${ssh}`);

  await exec(ssh);
}

async function deleteDir (cmd, dir, remoteInfo) {
  const { prefix, id, ip } = remoteInfo;
  const rm = Cmd.rm(true, dir);
  const ssh = cmd.ssh(rm);

  logger.info(`deleteDir - ${prefix} ${id} ${ip} command - ${ssh}`);

  try {
    await exec(ssh);
  } catch (err) {
    if (err.code === 1) {
      logger.info(`${dir} is not found on ${prefix} ${id} ${ip}`);
    } else {
      throw Error(err.stderr);
    }
  }
}

async function killBenchmarker (cmd) {
  const kill = Cmd.killBenchmarker();
  const ssh = cmd.ssh(kill);

  logger.info(`kill benchmarker - ${cmd.ip} command - ${ssh}`);

  try {
    await exec(ssh);
  } catch (err) {
    if (err.code === 1) {
      // don't do anything because there may be no running process
      return;
    }
    logger.info(err.message);
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

  logger.info(`runJar ${prefix} ${id} ${ip} command - ${ssh}`);

  try {
    await exec(ssh);
  } catch (err) {
    throw Error(err.stderr);
  }
}

async function pullCsv (cmd, resultDir, remoteInfo) {
  const { prefix, id, ip } = remoteInfo;
  const grepCsv = Cmd.grepCsv(resultDir, id);
  const ssh = cmd.ssh(grepCsv);

  logger.info(`pullCsv ${prefix} ${id} ${ip} command - ${ssh}`);

  const result = await exec(ssh);
  return result;
}

async function getTotalThroughput (cmd, resultDir, remoteInfo) {
  const { prefix, id, ip } = remoteInfo;
  const grepTotal = Cmd.grepTotal(resultDir, id);
  const ssh = cmd.ssh(grepTotal);

  logger.info(`get total throughput ${prefix} ${id} ${ip} command - ${ssh}`);

  const result = await exec(ssh);
  return result;
}

async function grepLog (cmd, keyword, logPath, remoteInfo) {
  const { prefix, id, ip } = remoteInfo;
  const grep = Cmd.grep(keyword, logPath);
  const ssh = this.cmd.ssh(grep);

  logger.info(`grep log ${prefix} ${id} ${ip} command - ${ssh}`);

  const result = await exec(ssh);
  return result;
}

async function checkLog (cmd, keyword, logPath, remoteInfo) {
  const { prefix, id, ip } = remoteInfo;
  const grep = Cmd.grep(keyword, logPath);
  const ssh = cmd.ssh(grep);

  logger.info(`checkLog ${prefix} ${id} ${ip} command - ${ssh}`);

  // don't try catch here, let outer functions to handle
  // please return the result.
  const result = await exec(ssh);
  return result;
}

async function checkError (cmd, keyword, logPath, remoteInfo) {
  const { prefix, id, ip } = remoteInfo;

  let result;
  try {
    result = await checkLog(cmd, keyword, logPath, remoteInfo);
  } catch (err) {
    // grep will return 1 if it greps nothing
    if (err.code === 1) {
      return;
    }
    throw Error(err.stderr);
  }

  // grep error keyword on the remote, so throw an error
  const { stdout } = result;
  throw Error(`grep error on ${prefix} ${id} ${ip} - ${stdout}`);
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
  checkError,
  checkLog,
  pullCsv,
  getTotalThroughput,
  grepLog
};
