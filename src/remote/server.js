const Cmd = require('../ssh/cmd');
const logger = require('../logger');
const ConnectionLog = require('./connection-log');

const { join } = require('../utils');
const {
  BENCH_DIR,
  CHECKING_INTERVAL,
  delay,
  Action,
  sendDir,
  copyDir,
  deleteDir,
  runJar
} = require('../actions/remote-actions');

class Server {
  constructor (configParam, conn, dbName, vmArgs, isSequencer, isStandAlone) {
    const {
      dbDir,
      systemUserName,
      systemRemoteWorkDir,
      serverJarPath,
      javaBin,
      sequencerVmHeap,
      serversVmHeap
    } = configParam;

    this.id = conn.id;
    this.ip = conn.ip;
    this.port = conn.port;

    this.dbDir = dbDir;
    this.systemRemoteWorkDir = systemRemoteWorkDir;
    this.jarPath = serverJarPath;
    this.javaBin = javaBin;

    this.dbName = `${dbName}-${conn.id}`;
    this.dbNameBackup = this.dbName + '-backup';
    this.dbPath = join(this.dbDir, this.dbName);
    this.dbBackupPath = join(this.dbDir, this.dbNameBackup);

    this.vmArgs = this.isSequencer ? `${sequencerVmHeap} ` : `${serversVmHeap} ` + vmArgs;
    this.procName = `server ${conn.id}`;
    this.isSequencer = isSequencer;
    this.prefix = this.isSequencer ? 'sequencer' : 'server';
    this.remoteInfo = {
      prefix: this.prefix,
      id: this.id,
      ip: this.ip
    };
    this.isStandAlone = isStandAlone;

    this.cmd = new Cmd(systemUserName, conn.ip);

    // [this.dbName] [connection.id] ([isSequencer])
    this.progArgs = this.isSequencer ? `${this.dbName} ${conn.id} 1` : `${this.dbName} ${conn.id}`;
    this.logPath = this.isSequencer ? `${systemRemoteWorkDir}/server-seq.log` : `${systemRemoteWorkDir}/server-${conn.id}.log`;
    this.connLog = new ConnectionLog(this.cmd, this.logPath, this.remoteInfo);

    this.stopSignal = false;
  }

  async run (action) {
    await this.prepare(action);

    await this.start();

    while (!await this.checkForReady()) {
      await delay(CHECKING_INTERVAL);
    }

    logger.debug(`server ${this.id} is ready`);
  }

  async checkError () {
    logger.debug(`${this.procName} starts checking error`.white);
    while (!this.stopSignal) {
      await this.checkForError();
      await delay(CHECKING_INTERVAL);
    }
    logger.debug(`${this.procName} stops checking error`.white);
  }

  stopCheckingError () {
    this.stopSignal = true;
  }

  async prepare (action) {
    logger.debug(`preparing servers... ip - ${this.ip}`);

    await this.sendBenchDir();

    if (action === Action.loading) {
      await this.deleteDbDir();
      await this.deleteBackupDbDir();
    } else if (action === Action.benchmarking) {
      await this.resetDbDir();
    }
  }

  async sendBenchDir () {
    logger.debug(`sending benchmarker to ${this.procName}...`);
    await sendDir(this.cmd, BENCH_DIR, this.systemRemoteWorkDir, this.remoteInfo);
  }

  async deleteDbDir () {
    logger.debug(`deleting database directory on ${this.procName}`);
    await deleteDir(this.cmd, this.dbPath, this.remoteInfo);
  }

  async deleteBackupDbDir () {
    logger.debug(`deleting backup directory on ${this.procName}`);
    await deleteDir(this.cmd, this.dbBackupPath, this.remoteInfo);
  }

  async backupDb () {
    // stand alone sequencer does not have database
    if (this.isSequencer && this.isStandAlone) {
      return;
    }

    logger.debug(`backing up the db of ${this.procName}`);

    await copyDir(this.cmd, this.dbPath, this.dbBackupPath, this.remoteInfo);
  }

  async resetDbDir () {
    await this.deleteDbDir();

    // the only thing that sequencer has to do is to delete its own db directory
    if (this.isSequencer && this.isStandAlone) {
      return;
    }

    logger.debug(`resetting the db of ${this.procName}`);

    await copyDir(this.cmd, this.dbBackupPath, this.dbPath, this.remoteInfo);
  }

  async start () {
    await runJar(this.cmd, this.progArgs, this.javaBin, this.vmArgs, this.jarPath, this.logPath, this.remoteInfo);
  }

  async checkForReady () {
    logger.debug(`check whether ${this.procName} is ready...`);
    // we grep Error keywords on the server
    try {
      await this.checkForError();
    } catch (err) {
      throw Error(err);
    }

    // return true if we grep ready
    try {
      await this.connLog.grepLog('ElaSQL server ready');
      return true;
    } catch (err) {
      const { code } = err;
      logger.debug(JSON.stringify(err));
      if (code === 1) {
        // didn't grep the keyword
        return false;
      } else {
        throw Error(err.stderr);
      }
    }
  }

  async checkForError () {
    // These three grepError should be in order
    // Error occurs only if we grep these keywords on the remote
    await this.connLog.grepError('Exception');
    await this.connLog.grepError('error');
    await this.connLog.grepError('SEVERE');
  }
}

module.exports = Server;
