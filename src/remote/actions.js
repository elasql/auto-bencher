const Cmd = require('../cmd/cmd-generator');
const { exec } = require('../cmd/cmd-executor');

// TODO: add logger.debug

async sendBenchDirToRemote (remoteWorkDir) {
  const scp = Cmd.scp(true, 'benchmarker', remoteWorkDir);
}

async function checkLogOnRemote (cmd, keyword, logPath) {
  const grep = Cmd.grep(keyword, logPath);
  const ssh = cmd.ssh(grep);
  // don't try catch here, let outside functions to handle
  // please return the result.
  const result = await exec(ssh);
  return result;
}

async function checkErrorOnRemote (cmd, keyword, logPath, id, isServer) {
  let result;
  try {
    result = await checkRemoteLog(cmd, keyword, logPath);
  } catch (err) {
    // grep will return 1 if it greps nothing
    if (err.code === 1) {
      return;
    }
    throw Error(err.message);
  }

  // grep error keyword on the remote, so throw an error
  const { stdout } = result;
  const prefix = isServer ? 'server' : 'client';
  throw Error(`grep error on ${prefix} ${id} - ${stdout}`);
}

module.exports = {
  checkRemoteError,
  checkRemoteLog
}