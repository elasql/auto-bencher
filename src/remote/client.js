const logger = require('../logger');
const Cmd = require('../ssh/cmd');
const ConnectionLog = require('../remote/connection-log');
const {
  Action,
  BENCH_DIR,
  CHECKING_INTERVAL,
  delay,
  sendDir,
  deleteDir,
  runJar,
  pullCsv,
  getTotalThroughput
} = require('../actions/remote-actions');

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
    this.remoteInfo = {
      prefix: 'client',
      id: this.id,
      ip: this.ip
    };
    this.procName = `client ${conn.id}`;

    this.jarPath = clientJarPath;
    this.javaBin = javaBin;
    this.resultDir = resultDir;

    this.vmArgs = vmArgs;

    this.logPath = systemRemoteWorkDir + `/client-${conn.id}.log`;
    this.cmd = new Cmd(systemUserName, conn.ip);
    this.connLog = new ConnectionLog(this.cmd, this.logPath, this.remoteInfo);
  }

  async run (action, reportDir) {
    logger.debug(`cleaning previous results on client - ${this.id}`);
    await this.cleanPreviousResults();

    logger.debug(`send benchmark directory to client - ${this.id}`);
    await this.sendBenchDir();

    logger.info(`client - ${this.id} starts`);
    await this.start(action);

    while (!await this.checkForFinished(action)) {
      await delay(CHECKING_INTERVAL);
    }

    if (action === Action.benchmarking) {
      await this.pullCsv(reportDir);
      const throughput = await this.getTotalThroughput();
      logger.info(`The total throughput of client ${this.id} is ${throughput}`);
    }

    logger.info(`${this.procName}'s job is done`);
  }

  async sendBenchDir () {
    logger.debug(`sending benchmarker to ${this.procName}...`);
    await sendDir(this.cmd, BENCH_DIR, this.systemRemoteWorkDir, this.remoteInfo);
  }

  async cleanPreviousResults () {
    logger.debug(`deleting previous results on ${this.procName}...`);
    await deleteDir(this.cmd, this.resultDir, this.remoteInfo);
  }

  async start (action) {
    logger.debug(`starting client ${this.id}`);
    // [clientId] [action]
    const progArgs = `${this.id} ${action}`;
    await runJar(this.cmd, progArgs, this.javaBin, this.vmArgs, this.jarPath, this.logPath, this.remoteInfo);
  }

  async checkForFinished (action) {
    logger.debug(`check whether ${this.procName} is finished...`);
    const keyword = this._getExpectedMsgAfterActionFinished(action);
    // we grep Error keywords on the client
    try {
      await this.checkForError();
    } catch (err) {
      throw Error(err);
    }

    // return true if we grep the keyword of procedure finished
    try {
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

  _getExpectedMsgAfterActionFinished (action) {
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
    logger.debug(`pulling the csv file on ${this.procName}...`);
    try {
      const { stdout } = await pullCsv(this.cmd, this.resultDir, this.remoteInfo);
      return stdout;
    } catch (err) {
      if (err.code === 1) {
        throw Error(`cannot find the csv file on ${this.ip}`);
      }
      throw Error(err.stderr);
    }
  }

  async getTotalThroughput () {
    logger.debug(`get total throughput on ${this.procName}...`);
    let stdout = '';
    try {
      const result = await getTotalThroughput(this.cmd, this.resultDir, this.remoteInfo);
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
