const Cmd = require('../ssh/cmd');
const { exec } = require('../ssh/ssh-executor');

// We need this class because both server and client will use these methods.
// Don't write the similar code in those two files, it is hard to maintain.
class ConnectionLog {
  constructor (cmd, logPath, id, isServer) {
    this.cmd = cmd;
    this.logPath = logPath;
    this.id = id;
    this.prefix = isServer ? 'server' : 'client';
  }

  async grepLog (keyword) {
    const grep = Cmd.getGrep(keyword, this.logPath);
    const ssh = this.cmd.getSsh(grep);
    // don't try catch here, let the outside function to handle
    // please return the result.
    const result = await exec(ssh);
    return result;
  }

  async grepError (keyword) {
    let result;
    try {
      result = await this.grepLog(keyword);
    } catch (err) {
      if (err.code === 1) {
        // grep nothing means the node is working properly, so let it return
        return;
      }
      throw Error(err.stderr);
    }

    // find error on the node, so throw an error
    const { stdout } = result;
    throw Error(`${this.prefix} ${this.id} error: ${stdout}`);
  }
};

module.exports = ConnectionLog;
