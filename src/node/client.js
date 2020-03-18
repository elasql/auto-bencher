const logger = require('../logger');
const ShellCmd = require('../shell-cmd');
const { exec } = require('../child-process');
const { Action, ConnectionLog, CHECKING_INTERVAL, delay } = require('./connection');

class Client {
  constructor (configParam, conn, vmArgs) {
    const {
      systemUserName,
      systemRemoteWorkDir,
      clientJarPath,
      javaBin,
      resultDir
    } = configParam;
    this.systemRemoteWorkDir = systemRemoteWorkDir;

    this.id = conn.id;
    this.ip = conn.ip;
    this.port = conn.port;

    this.jarPath = clientJarPath;
    this.javaBin = javaBin;
    this.resultDir = resultDir;

    this.vmArgs = vmArgs;

    this.logPath = systemRemoteWorkDir + `/client-${conn.id}.log`;
    this.shellCmd = new ShellCmd(systemUserName, conn.ip);
    this.connLog = new ConnectionLog(this.shellCmd, this.logPath, conn.id, true);
  }

  async run (action, reportDir) {
    logger.info(`cleaning previous results on client - ${this.id}`);
    await this.cleanPreviousResults();

    logger.info(`send benchmark directory to cleint - ${this.id}`);
    await this.sendBenchDir();

    logger.info(`client - ${this.id} starts`);
    await this.start(action);

    while (!await this.checkForFinished(action)) {
      await delay(CHECKING_INTERVAL);
    }

    if (action === Action.benchmarking) {
      await this.pullCsv(reportDir);
      const throughput = await this.getTotalThroughput();
      logger.debug(`The total throughput of client ${this.id} is ${throughput}`);
    }
  }

  async sendBenchDir () {
    const scp = this.shellCmd.getScp(true, 'benchmarker', this.systemRemoteWorkDir);
    await exec(scp);
  }

  async cleanPreviousResults () {
    const rm = ShellCmd.getRm(true, this.resultDir);
    const ssh = this.shellCmd.getSsh(rm);
    try {
      await exec(ssh);
    } catch (err) {
      if (err.code === 1) {
        logger.debug(`no previous results are found on ${this.ip}`);
      } else {
        throw Error(err.stderr);
      }
    }
  }

  async start (action) {
    logger.debug(`starting client ${this.id}`);
    // [clientId] [action]
    const progArgs = `${this.id} ${action}`;
    const runJar = ShellCmd.getRunJar(
      this.javaBin,
      this.vmArgs,
      this.jarPath,
      progArgs,
      this.logPath
    );
    const ssh = this.shellCmd.getSsh(runJar);
    logger.debug(`client ${this.id} is running`);

    try {
      await exec(ssh);
    } catch (err) {
      throw Error(err.message);
    }
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
    const grepCsv = ShellCmd.getGrepCsv(this.resultDir, this.id);
    const ssh = this.shellCmd.getSsh(grepCsv);

    try {
      const { stdout } = await exec(ssh);
      return stdout;
    } catch (err) {
      if (err.code === 1) {
        throw Error(`cannot find the csv file on ${this.ip}`);
      }
      throw Error(err.stderr);
    }
  }

  async getTotalThroughput () {
    const grepTotal = ShellCmd.getGrepTotal(this.resultDir, this.id);
    const ssh = this.shellCmd.getSsh(grepTotal);
    let stdout = '';
    try {
      const result = await exec(ssh);
      stdout = result.stdout;
    } catch (err) {
      if (err.code === 1) {
        throw Error(`cannot find the total throughput files on ${this.ip}`);
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

module.exports = Client;
