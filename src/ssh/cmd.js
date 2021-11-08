/*
NOTICE!!

Naming convention:
path should contain the directory name and the file name

path = workdir + dir + fileName

e.g.
path == /home/pinyu/main.js
workdir == /home
dir == pinyu
fileName == main.js
*/

const { join } = require('../utils');

class Cmd {
  constructor (userName, ip) {
    this.userName = userName;
    this.ip = ip;
  }

  _host () {
    return this.userName + '@' + this.ip;
  }

  _remoteDest (remotePath) {
    return this._host() + ':' + remotePath;
  }

  static mkdir (dir) {
    return 'mkdir -p ' + dir;
  }

  static javaVersion (workDir, jdkDir) {
    return join(workDir, jdkDir, '/bin/java') + ' -version';
  }

  static tar (workDir, target) {
    return 'tar -C ' + workDir + ' -zxf ' + join(workDir, target);
  }

  static rm (isDir, target) {
    const cmd = isDir ? 'rm -rf ' : 'rm ';
    return cmd + target;
  }

  static cp (isDir, src, dest) {
    const cmd = isDir ? 'cp -r ' : 'cp ';
    return cmd + src + ' ' + dest;
  }

  static runJar (javaBin, vmArgs, jarPath, progArgs, logPath) {
    return `sudo ${javaBin} ${vmArgs} -XX:ThreadPriorityPolicy=1 -jar ${jarPath} ${progArgs} > ${logPath} 2>&1 &`;
  }

  static grep (keyword, logPath) {
    // use quotation mark to wrap the keyword
    // or it will cause error if blanks exist
    let grep = `grep \\"${keyword}\\"`;
    grep += logPath ? ` ${logPath}` : '';
    return grep;
  }

  static grepCsv (resultDir, id) {
    // [.] is grep style regular expression
    return `${Cmd.ls(resultDir)} | ${Cmd.grep(`${id}[.]csv`)}`;
  }

  static grepTotal (resultDir, id) {
    return `${Cmd.grep('TOTAL')} ${resultDir}/*-${id}.txt`;
  }

  static ls (path) {
    return `ls ${path}`;
  }

  static killBenchmarker () {
    return 'sudo pkill -f benchmarker';
  }

  scp (isDir, localPath, remotePath, fromRemote = false) {
    const cmd = isDir ? 'scp -r ' : 'scp ';

    if (fromRemote) {
      return cmd + this._remoteDest(remotePath) + ' ' + localPath;
    }

    return cmd + localPath + ' ' + this._remoteDest(remotePath);
  }

  ssh (remoteCmd) {
    const cmd = 'ssh ';
    return cmd + this._host() + ` "${remoteCmd}"`;
  }

  sshOnRemoteWorkingDir (systemRemoteWorkDir, remoteCmd) {
    const cmd = 'ssh ';
    return cmd + `-t ` + this._host() + ` "cd ${systemRemoteWorkDir}; ${remoteCmd}"`;
  }
}

module.exports = Cmd;
