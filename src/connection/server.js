const logger = require('../logger');
const ShellCmdGenerator = require('../shell-cmd-generator');
const { exec } = require('../child-process');

class Server {
  constructor (params, conn, dbName, vmArgs, isSequencer) {
    const {
      dbDir,
      systemUserName,
      systemRemoteWorkDir,
      serverJarPath,
      javaBin
    } = params;

    this.dbDir = dbDir;
    this.systemRemoteWorkDir = systemRemoteWorkDir;
    this.jarPath = serverJarPath;
    this.javaBin = javaBin;

    this.conn = conn;
    this.dbName = `${dbName}-${conn.id}`;
    this.dbNameBackup = this.dbName + '-backup';
    this.vmArgs = vmArgs;
    this.procName = `server ${conn.id}`;
    this.isSequencer = isSequencer;

    this.cmdGen = new ShellCmdGenerator(systemUserName, this.conn.ip);

    // [this.dbName] [connection.id] ([isSequencer])
    this.progArgs = this.isSequencer ? `${this.dbName} ${conn.id} 1` : `${this.dbName} ${conn.id}`;
    this.logPath = this.isSequencer ? `${systemRemoteWorkDir}/server-seq.log` : `${systemRemoteWorkDir}/server-${conn.id}.log`;
  }

  async sendBenchDir () {
    logger.info(`sending benchmarker to ${this.procName}...`);
    const cmd = this.cmdGen.getScp(true, 'benchmarker', this.systemRemoteWorkDir);
    await exec(cmd);
  }

  async deleteDbDir () {
    logger.info(`deleting database directory on ${this.procName}`);
    const rm = ShellCmdGenerator.getRm(true, this.dbDir, this.dbName);
    const ssh = this.cmdGen.getSsh(rm);
    try {
      await exec(ssh);
    } catch (err) {
      if (err.code === 1) {
        logger.info(`no previous database is found on ${this.conn.ip}`);
      } else {
        throw Error(err.stderr);
      }
    }
  }

  async deleteBackupDbDir () {
    logger.info(`deleting backup directory on ${this.procName}`);
    const rm = ShellCmdGenerator.getRm(true, this.dbDir, this.dbNameBackup);
    const ssh = this.cmdGen.getSsh(rm);
    try {
      await exec(ssh);
    } catch (err) {
      if (err.code === 1) {
        logger.info(`no backup database is found on ${this.conn.ip}`);
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

    logger.info(`backing up the db of ${this.procName}`);
    const cp = ShellCmdGenerator.getCp(true, this.dbDir, this.dbNameBackup);
    const ssh = this.cmdGen.getSsh(cp);
    await exec(ssh);
  }

  async resetDbDir () {
    // the only thing that sequencer has to do is to delete its own db directory
    if (this.isSequencer) {
      this.deleteDbDir();
    }

    logger.info(`resetting the db of ${this.procName}`);
    const cp = ShellCmdGenerator.getCp(true, this.dbDir, this.dbNameBackup);
    const ssh = this.cmdGen.getSsh(cp);
    await exec(ssh);
  }

  async start () {
    const runJar = ShellCmdGenerator.getRunJar(
      this.javaBin,
      this.vmArgs,
      this.jarPath,
      this.progArgs,
      this.logPath
    );
    const ssh = this.cmdGen.getSsh(runJar);
    await exec(ssh);
  }

  async grepLog (keyword) {
    const grep = ShellCmdGenerator.getGrep(keyword, this.logPath);
    const ssh = this.cmdGen.getSsh(grep);
    // Don't try catch here, we need to pass this error to the caller
    const result = await exec(ssh);
    return result;
  }

  async checkForReady () {
    try {
      await this.grepLog('ElaSQL server ready');
      return true;
    } catch (err) {
      const { code } = err;
      if (code === 1) {
        return false;
      } else {
        throw Error('There are something wrong while checkForReady');
      }
    }
  }

  async checkForError () {
    // These three grepError should be in order
    let errMsg = await this.grepError('Exception');
    if (errMsg !== '') {
      throw Error(errMsg);
    }

    errMsg = await this.grepError('error');
    if (errMsg !== '') {
      throw Error(errMsg);
    }

    errMsg = await this.grepError('SEVERE');
    if (errMsg !== '') {
      throw Error(errMsg);
    }
  }

  async grepError (msg) {
    try {
      const { stdout } = await this.grepLog('Exception');
      return `server ${this.conn.id} error: ${stdout}`;
    } catch (err) {
      // It is ok to return a empty string in this catch block
      return '';
    }
  }
}

module.exports = Server;
