/*
NOTICE!!

Naming convention:
path should contain directory name and file name

path = dir / fileName

*/

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

  static getMkdir (workDir, dir) {
    return 'mkdir -p ' + workDir + '/' + dir;
  }

  static getJavaVersion (workDir, jdkDir) {
    return workDir + '/' + jdkDir + '/bin/java -version';
  }

  static getTar (workDir, target) {
    return 'tar -C ' + workDir + ' -zxf ' + workDir + '/' + target;
  }

  static getRm (workDir, target) {
    return 'rm ' + workDir + '/' + target;
  }

  getScp (isDir, localPath, remotePath) {
    let cmd = 'scp ';
    if (isDir) {
      cmd += '-r ';
    }
    return cmd + localPath + ' ' + this._getRemoteDest(remotePath);
  }

  getSsh (remoteCmd) {
    const cmd = 'ssh ';
    return cmd + this._getHost() + ' ' + remoteCmd;
  }

  getCp (isDir, src, dest) {
    let cmd = 'cp ';
    if (isDir) {
      cmd += '-r ';
    }
    return cmd + src + ' ' + dest;
  }
}

module.exports = ShellCmdGenerator;
