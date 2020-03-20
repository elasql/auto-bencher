const Cmd = require('../cmd/cmd-generator');
const { exec } = require('../cmd/cmd-executor');
const logger = require('../logger');

const Action = {
  loading: 1,
  benchmarking: 2
};

const delay = (interval) => {
  return new Promise(resolve => setTimeout(resolve, interval));
};

// TODO: add logger.debug

async function sendDir (localPath, remoteWorkDir, remoteInfo) {
  const scp = Cmd.scp(true, localPath, remoteWorkDir);
  // don't try catch here
  // let it error
  await exec(scp);
}

async function deleteDir (cmd, dir, remoteInfo) {
  const { prefix, id, ip } = remoteInfo;
  const rm = Cmd.rm(true, dir);
  const ssh = cmd.ssh(rm);

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
async function cleanDir (cmd, dir, remoteInfo) {
  const { prefix, id, ip } = remoteInfo;
  const rm = Cmd.rm(true, dir);
  const ssh = cmd.ssh(rm);

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
  logger.info(`${prefix} ${id} ${ip} is running`);

  try {
    await exec(ssh);
  } catch (err) {
    throw Error(err.message);
  }
}



async function checkLog (cmd, keyword, logPath) {
  const grep = Cmd.grep(keyword, logPath);
  const ssh = cmd.ssh(grep);
  // don't try catch here, let outside functions to handle
  // please return the result.
  const result = await exec(ssh);
  return result;
}

async function checkError (cmd, keyword, logPath, remoteInfo) {
  const { prefix, id, ip } = remoteInfo;
  let result;
  try {
    result = await checkLog(cmd, keyword, logPath);
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
  delay,
  sendDir,
  deleteDir,
  cleanDir,
  runJar,
  checkError,
  checkLog
};
