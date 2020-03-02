/*
NOTICE!!

Naming convention:
path should contain directory name and file name

path = dir / fileName

*/
const BIN_JAVA = '/bin/java';

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
    return workDir + '/' + jdkDir + BIN_JAVA + ' -version';
  }

  static getTar (workDir, target) {
    return 'tar -C ' + workDir + ' -zxf ' + workDir + '/' + target;
  }

  static getRm (isDir, workDir, target) {
    let cmd = 'rm ';
    cmd = isDir ? cmd + '-rf ' : cmd;
    cmd += workDir + '/' + target;
    return cmd;
  }

  static getCp (isDir, src, dest) {
    let cmd = 'cp ';
    cmd = isDir ? cmd + '-r ' : cmd;
    return cmd + src + ' ' + dest;
  }

  static getRunJar (workDir, jdkDir, vmArgs, jarPath, progArgs, logPath) {
    const binJava = workDir + '/' + jdkDir + BIN_JAVA;
    return `${binJava} ${vmArgs} -jar ${jarPath} ${progArgs} > ${logPath} 2>&1 &`;
  }

  getScp (isDir, localPath, remotePath) {
    let cmd = 'scp ';
    cmd = isDir ? cmd + '-r ' : cmd;
    return cmd + localPath + ' ' + this._getRemoteDest(remotePath);
  }

  getSsh (remoteCmd) {
    const cmd = 'ssh ';
    return cmd + this._getHost() + ' ' + remoteCmd;
  }
}

module.exports = ShellCmdGenerator;
