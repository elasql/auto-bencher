const { grepLog } = require('../actions/remote-actions');

// We need this class because both server and client will use these methods.
// Don't write the similar code in those two files, it is hard to maintain.

// TODO: rename this class -> LogInspector
class ConnectionLog {
  constructor (cmd, logPath, remoteInfo) {
    this.cmd = cmd;
    this.logPath = logPath;
    this.remoteInfo = remoteInfo;
  }

  async grepLog (keyword) {
    const result = await grepLog(this.cmd, keyword, this.logPath, this.remoteInfo);
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

    const { prefix, id } = this.remoteInfo;

    // found error on the node, so throw an error
    const { stdout } = result;
    throw Error(`${prefix} ${id} error: ${stdout}`);
  }
};

module.exports = ConnectionLog;
