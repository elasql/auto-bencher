class ShellCmdGenerator {
  constructor (userName, ip) {
    this.userName = userName;
    this.ip = ip;
  }

  _getHost () {
    return this.userName + '@' + this.ip;
  }

  _getRemoteDest (remotePath) {
    return this._getHost() + ':' + remotePath;
  }

  getScpCmd (isDir, localPath, remotePath) {
    let cmd = 'scp ';
    if (isDir) {
      cmd += '-r ';
    }
    return cmd + localPath + ' ' + this._getRemoteDest(remotePath);
  }

  getSshCmd (remoteCmd) {
    const cmd = 'ssh ';
    return cmd + this._getHost() + ' ' + remoteCmd;
  }

  getCpCmd (isDir, src, dest) {
    let cmd = 'cp ';
    if (isDir) {
      cmd += '-r ';
    }
    return cmd + src + ' ' + dest;
  }
}

module.exports = ShellCmdGenerator;
