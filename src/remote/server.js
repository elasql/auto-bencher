const logger = require('../logger');
const Cmd = require('../ssh/cmd');
const ConnectionLog = require('./connection-log');
const path = require('path');
const join = path.posix.join;
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
  constructor (configParam, conn, dbName, vmArgs, isSequencer) {
    const {
      dbDir,
      systemUserName,
      systemRemoteWorkDir,
      serverJarPath,
      javaBin
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
    this.vmArgs = vmArgs;
    this.procName = `server ${conn.id}`;
    this.isSequencer = isSequencer;
    this.prefix = this.isSequencer ? 'sequencer' : 'server';
    this.remoteInfo = {
      prefix: this.prefix,
      id: this.id,
      ip: this.ip
    };

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
    logger.info(`${this.procName} starts checking error`);
    while (!this.stopSignal) {
      await this.checkForError();
      await delay(CHECKING_INTERVAL);
    }
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
    await deleteDir(this.cmd, join(this.dbDir, this.dbName), this.remoteInfo);
  }

  async deleteBackupDbDir () {
    logger.debug(`deleting backup directory on ${this.procName}`);
    await deleteDir(this.cmd, join(this.dbDir, this.dbNameBackup), this.remoteInfo);
  }

  async backupDb () {
    // sequencer does not have database
    if (this.isSequencer) {
      return;
    }

    logger.debug(`backing up the db of ${this.procName}`);

    // TODO: move the following two lines to constructer and test them
    const srcDir = join(this.dbDir, this.dbName);
    const destDir = join(this.dbDir, this.dbNameBackup);
    await copyDir(this.cmd, srcDir, destDir, this.remoteInfo);
  }

  async resetDbDir () {
    // the only thing that sequencer has to do is to delete its own db directory
    if (this.isSequencer) {
      this.deleteDbDir();
    }

    logger.debug(`resetting the db of ${this.procName}`);

    // TODO: move the following two lines to constructer and test them
    const srcDir = join(this.dbDir, this.dbNameBackup);
    const destDir = join(this.dbDir, this.dbName);
    await copyDir(this.cmd, srcDir, destDir, this.remoteInfo);
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
