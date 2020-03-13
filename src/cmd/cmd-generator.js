/*
NOTICE!!

Naming convention:
path should contain directory name and file name

path = workdir + dir + fileName

e.g.
path == /home/pinyu/main.js
workdir == /home
dir == pinyu
fileName == main.js
*/

const path = require('path');
const join = path.posix.join;

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

  static mkdir (workDir, dir) {
    return 'mkdir -p ' + join(workDir, dir);
  }

  static javaVersion (workDir, jdkDir) {
    return join(workDir, jdkDir, '/bin/java') + ' -version';
  }

  static tar (workDir, target) {
    return 'tar -C ' + workDir + ' -zxf ' + join(workDir, target);
  }

  static rm (isDir, workDir, target) {
    const cmd = isDir ? 'rm -rf ' : 'rm ';
    const dest = target ? join(workDir, target) : workDir;
    return cmd + dest;
  }

  static cp (isDir, src, dest) {
    const cmd = isDir ? 'cp -r ' : 'cp ';
    return cmd + src + ' ' + dest;
  }

  static runJar (javaBin, vmArgs, jarPath, progArgs, logPath) {
    return `${javaBin} ${vmArgs} -jar ${jarPath} ${progArgs} > ${logPath} 2>&1 &`;
  }

  static grep (keyword, logPath) {
    let grep = `grep \\"${keyword}\\"`;
    grep += logPath ? ` ${logPath}` : '';
    return grep;
  }

  static grepCsv (resultDir, id) {
    return `${Cmd.ls(resultDir)} | ${Cmd.grep(`${id}[.]csv`)}`;
  }

  static grepTotal (resultDir, id) {
    return `${Cmd.grep('TOTAL')} ${resultDir}/*-${id}.txt`;
  }

  static ls (path) {
    return `ls ${path}`;
  }

  static killBenchmarker () {
    return 'pkill -f benchmarker';
  }

  scp (isDir, localPath, remotePath) {
    const cmd = isDir ? 'scp -r ' : 'scp ';
    return cmd + localPath + ' ' + this._remoteDest(remotePath);
  }

  ssh (remoteCmd) {
    const cmd = 'ssh ';
    return cmd + this._host() + ` "${remoteCmd}"`;
  }
}

module.exports = Cmd;
