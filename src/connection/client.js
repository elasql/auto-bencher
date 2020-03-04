const logger = require('../logger');
const ShellCmd = require('../shell-cmd');
const { exec } = require('../child-process');
const { Action, ConnectionLog } = require('./connection');

class Client {
  constructor (configParams, conn, vmArgs) {
    const {
      systemUserName,
      systemRemoteWorkDir,
      clientJarPath,
      javaBin,
      resultPath
    } = configParams;

    this.jarPath = clientJarPath;
    this.javaBin = javaBin;
    this.resultPath = resultPath;

    this.conn = conn;
    this.vmArgs = vmArgs;

    this.logPath = systemRemoteWorkDir + `/client-${conn.id}.log`;
    this.shellCmd = new ShellCmd(systemUserName, conn.ip);
    this.connLog = new ConnectionLog(this.shellCmd, this.logPath, conn.id, true);
  }

  async sendBenchDir () {
    const scp = this.shellCmd.getScp(true, 'benchmarker', this.systemRemoteWorkDir);
    await exec(scp);
  }

  async cleanPreviousResults () {
    const rm = ShellCmd.getRm(true, this.resultPath);
    const ssh = this.shellCmd.getSsh(rm);
    try {
      await exec(ssh);
    } catch (err) {
      if (err.code === 1) {
        logger.debug(`no previous results are found on ${this.conn.ip}`);
      } else {
        throw Error(err.stderr);
      }
    }
  }

  async start (action) {
    logger.debug(`starting client ${this.conn.id}`);
    // [clientId] [action]
    const progArgs = `${this.conn.id} ${action}`;
    const runJar = ShellCmd.getJavaVersion(
      this.javaBin,
      this.vmArgs,
      this.jarPath,
      progArgs,
      this.logPath
    );
    const ssh = this.shellCmd.getSsh(runJar);
    logger.debug(`client ${this.conn.id} is running`);
    await exec(ssh);
  }

  async checkForFinished (action) {
    const keyword = this._getExpectedMsgFromAction(action);
    try {
      await this.checkForError();
      await this.connLog.grepLog(keyword);
      return true;
    } catch (err) {
      if (err.code === 1) {
        return false;
      }
      throw Error(err.stderr);
    }
  }

  async checkForError () {
    await this.connLog.grepError('Exception');
    await this.connLog.grepError('error');
    await this.connLog.grepError('SEVERE');
  }

  _getExpectedMsgFromAction (action) {
    switch (action) {
    case Action.benchmarking:
      return 'benchmark process finished';
    case Action.loading:
      return 'loading procedure finished';
    default:
      throw Error('no action');
    }
  }

  async pullCsv (dest) {
    const grepCsv = ShellCmd.getGrepCsv(this.resultPath, this.conn.id);
    const ssh = this.shellCmd.getSsh(grepCsv);

    try {
      const { stdout } = await exec(ssh);
      return stdout;
    } catch (err) {
      if (err.code === 1) {
        throw Error(`cannot find the csv file on ${this.conn.ip}`);
      }
      throw Error(err.stderr);
    }
  }

  async getTotalThroughput () {
    const grepTotal = ShellCmd.getGrepTotal(this.resultPath, this.conn.id);
    const ssh = this.shellCmd.getSsh(grepTotal);
    let stdout = '';
    try {
      const result = await exec(ssh);
      stdout = result.stdout;
    } catch (err) {
      if (err.code === 1) {
        throw Error(`cannot find the total throughput files on ${this.conn.ip}`);
      }
      throw Error(err.stderr);
    }
    return this.parseTotalThroughput(stdout);
  }

  parseTotalThroughput (text) {
    // Output should be 'TOTAL - committed: XXXX, aborted: yyyy, avg latency: zzz ms
    // we need to parse XXXX
    const reg = /committed: (.*?),/g;
    const matches = reg.exec(text);
    return matches[0];
  }
}

module.exports = {
  Client: Client
};
