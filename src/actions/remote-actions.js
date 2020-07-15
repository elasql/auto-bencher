const Cmd = require('../ssh/cmd');
const { exec } = require('../ssh/ssh-executor');
const logger = require('../logger');
const path = require('path');
const join = path.posix.join;

const Action = {
  loading: 1,
  benchmarking: 2
};

const defaultDirs = ['databases', 'results'];

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

async function sendJdk (cmd, jdkPackagePath, systemRemoteWorkDir) {
  const scp = cmd.scp(false, jdkPackagePath, systemRemoteWorkDir);

  logger.info(`sending JDK to - ${cmd.ip}`);

  // do NOT handle this execution, let it crash if error occurs
  await exec(scp);
}

async function unpackJdk (cmd, systemRemoteWorkDir, jdkPackageName) {
  const tar = Cmd.tar(systemRemoteWorkDir, jdkPackageName);
  const ssh = cmd.ssh(tar);

  logger.info(`unpacking ${jdkPackageName} on - ${cmd.ip}`);

  // do NOT handle this execution, let it crash if error occurs
  await exec(ssh);
}

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

async function sendDir (localPath, remoteWorkDir, remoteInfo) {
  const { prefix, id, ip } = remoteInfo;
  const scp = Cmd.scp(true, localPath, remoteWorkDir);

  logger.info(`sendDir - ${prefix} ${id} ${ip} command - ${scp}`);
  // don't try catch here
  // let it error
  await exec(scp);
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

async function runJar (cmd, action, javaBin, vmArgs, jarPath, logPath, remoteInfo) {
  const { prefix, id, ip } = remoteInfo;
  const progArgs = `${id} ${action}`;
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

async function pullCsv (cmd, resultDir, dest, remoteInfo) {
  const { prefix, id, ip } = remoteInfo;
  const grepCsv = Cmd.grepCsv(resultDir, id);
  const ssh = cmd.ssh(grepCsv);

  logger.info(`pullCsv ${prefix} ${id} ${ip} command - ${ssh}`);

  try {
    const { stdout } = await exec(ssh);
    return stdout;
  } catch (err) {
    if (err.code === 1) {
      throw Error(`cannot find the csv file on ${prefix} ${id} ${ip}`);
    }
    throw Error(err.stderr);
  }
}

async function getTotalThroughput (cmd, resultDir, remoteInfo) {
  const { prefix, id, ip } = remoteInfo;
  const grepTotal = Cmd.grepTotal(resultDir, id);
  const ssh = cmd.ssh(grepTotal);

  logger.info(`getTotalThroughput ${prefix} ${id} ${ip} command - ${ssh}`);

  let result;
  try {
    result = await exec(ssh);
  } catch (err) {
    if (err.code === 1) {
      throw Error(`cannot find the total throughput file on - ${prefix} ${id} ${ip}`);
    }
    throw Error(err.stderr);
  }

  const reg = /committed: (.*?),/g;
  const matches = reg.exec(result.stdout);
  return matches[0];
}

async function checkLog (cmd, keyword, logPath, remoteInfo) {
  const { prefix, id, ip } = remoteInfo;
  const grep = Cmd.grep(keyword, logPath);
  const ssh = cmd.ssh(grep);

  logger.info(`checkLog ${prefix} ${id} ${ip} command - ${ssh}`);

  // don't try catch here, let outside functions to handle
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
  createWorkingDir,
  checkJavaRunTime,
  sendJdk,
  unpackJdk,
  removeJdk,
  delay,
  sendDir,
  deleteDir,
  runJar,
  checkError,
  checkLog,
  pullCsv,
  getTotalThroughput
};
