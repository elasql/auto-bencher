const logger = require('../logger');
const ShellCmdGenerator = require('../shell-cmd-generator');
const { exec } = require('../child-process');

class Server {
  constructor (params, conn, dbName, vmArgs, isSequencer) {
    const {
      dbDir,
      systemUserName,
      systemRemoteWorkDir,
      jarPath,
      javaBin
    } = params;

    this.dbDir = dbDir;
    this.systemUserName = systemUserName;
    this.systemRemoteWorkDir = systemRemoteWorkDir;
    this.jarPath = jarPath;
    this.javaBin = javaBin;

    this.conn = conn;
    this.dbName = `${dbName}-${conn.id}`;
    this.dbNameBackup = this.dbName + '-backup';
    this.vmArgs = vmArgs;
    this.procName = `server ${conn.id}`;
    this.isSequencer = isSequencer;

    this.cmdGen = new ShellCmdGenerator(this.systemUserName, this.conn.ip);

    // [dbName] [connection.id] ([isSequencer])
    this.progArgs = this.isSequencer ? `${this.dbName} ${this.conn.id} 1` : `${this.dbName} ${this.conn.id}`;
    this.logPath = this.isSequencer ? `${this.systemRemoteWorkDir}/server-seq.log` : `${this.systemRemoteWorkDir}/server-${this.conn.id}.log`;
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
      // catch the error if there is no previous database
      logger.info(err);
    }
  }

  async deleteBackupDbDir () {
    logger.info(`deleting backup directory on ${this.procName}`);
    const rm = ShellCmdGenerator.getRm(true, this.dbDir, this.dbNameBackup);
    const ssh = this.cmdGen.getSsh(rm);
    try {
      await exec(ssh);
    } catch (err) {
      // catch the error if there is no previous backup database
      logger.info(err);
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
        throw Error('There are something wrong in checkForReady');
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
