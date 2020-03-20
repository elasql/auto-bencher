const logger = require('../logger');
const ShellCmd = require('../shell-cmd');
const { exec } = require('../child-process');
const { ConnectionLog, Action, CHECKING_INTERVAL, delay } = require('./connection');

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

    this.shellCmd = new ShellCmd(systemUserName, conn.ip);

    // [this.dbName] [connection.id] ([isSequencer])
    this.progArgs = this.isSequencer ? `${this.dbName} ${conn.id} 1` : `${this.dbName} ${conn.id}`;
    this.logPath = this.isSequencer ? `${systemRemoteWorkDir}/server-seq.log` : `${systemRemoteWorkDir}/server-${conn.id}.log`;
    this.connLog = new ConnectionLog(this.shellCmd, this.logPath, conn.id, true);

    this.stopSignal = false;
  }

  async init (action) {
    await this.prepare(action);

    await this.start();
    while (true) {
      try {
        await this.checkForReady();
        break;
      } catch (err) {
        // It's Ok to do nothing
      }
      await delay(CHECKING_INTERVAL);
    }

    logger.info(`server ${this.id} is ready`);
  }

  async checkError () {
    while (!this.stopSignal) {
      await this.checkForError();
      await delay(CHECKING_INTERVAL);
    }
  }

  async prepare (action) {
    logger.info(`preparing servers... ip - ${this.ip}`);

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
    const cmd = this.shellCmd.getScp(true, 'benchmarker', this.systemRemoteWorkDir);
    await exec(cmd);
  }

  async deleteDbDir () {
    logger.debug(`deleting database directory on ${this.procName}`);
    const rm = ShellCmd.getRm(true, this.dbDir, this.dbName);
    const ssh = this.shellCmd.getSsh(rm);
    try {
      await exec(ssh);
    } catch (err) {
      if (err.code === 1) {
        logger.debug(`no previous database is found on ${this.ip}`);
      } else {
        throw Error(err.stderr);
      }
    }
  }

  async deleteBackupDbDir () {
    logger.debug(`deleting backup directory on ${this.procName}`);
    const rm = ShellCmd.getRm(true, this.dbDir, this.dbNameBackup);
    const ssh = this.shellCmd.getSsh(rm);
    try {
      await exec(ssh);
    } catch (err) {
      if (err.code === 1) {
        logger.debug(`no backup database is found on ${this.ip}`);
      } else {
        throw Error(err.stderr);
      }
    }
  }

  async backupDb () {
    // sequencer does not have database
    if (this.isSequencer) {
      return;
    }

    logger.debug(`backing up the db of ${this.procName}`);
    const cp = ShellCmd.getCp(true, this.dbDir, this.dbNameBackup);
    const ssh = this.shellCmd.getSsh(cp);
    await exec(ssh);
  }

  async resetDbDir () {
    // the only thing that sequencer has to do is to delete its own db directory
    if (this.isSequencer) {
      this.deleteDbDir();
    }

    logger.debug(`resetting the db of ${this.procName}`);
    const cp = ShellCmd.getCp(true, this.dbDir, this.dbNameBackup);
    const ssh = this.shellCmd.getSsh(cp);
    await exec(ssh);
  }

  async start () {
    const runJar = ShellCmd.getRunJar(
      this.javaBin,
      this.vmArgs,
      this.jarPath,
      this.progArgs,
      this.logPath
    );
    const ssh = this.shellCmd.getSsh(runJar);
    await exec(ssh);
  }

  async checkForReady () {
    try {
      await this.connLog.grepLog('ElaSQL server ready');
      return true;
    } catch (err) {
      const { code } = err;
      logger.debug(JSON.stringify(err));
      if (code === 1) {
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