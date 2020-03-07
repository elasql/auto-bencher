/*
NOTICE!!

Naming convention:
path should contain directory name and file name

path = dir / fileName

*/
class ShellCmd {
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
    return workDir + '/' + jdkDir + '/bin/java' + ' -version';
  }

  static getTar (workDir, target) {
    return 'tar -C ' + workDir + ' -zxf ' + workDir + '/' + target;
  }

  static getRm (isDir, workDir, target) {
    let cmd = 'rm ';
    cmd = isDir ? cmd + '-rf ' : cmd;
    cmd += workDir;
    cmd = target ? cmd + '/' + target : cmd;
    return cmd;
  }

  static getCp (isDir, src, dest) {
    let cmd = 'cp ';
    cmd = isDir ? cmd + '-r ' : cmd;
    return cmd + src + ' ' + dest;
  }

  static getRunJar (javaBin, vmArgs, jarPath, progArgs, logPath) {
    return `${javaBin} ${vmArgs} -jar ${jarPath} ${progArgs} > ${logPath} 2>&1 &`;
  }

  static getGrep (keyword, logPath) {
    return `grep '${keyword}' ${logPath}`;
  }

  static getGrepCsv (resultDir, id) {
    return `ls ${resultDir} | grep '${id}[.]csv'`;
  }

  static getGrepTotal (resultDir, id) {
    return `grep 'TOTAL' ${resultDir}/*-${id}.txt`;
  }

  static getLs (path) {
    return `ls ${path}`;
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

module.exports = ShellCmd;
