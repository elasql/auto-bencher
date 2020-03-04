const logger = require('../logger');
const ShellCmd = require('../shell-cmd');
const { exec } = require('../child-process');
const { Action } = require('./connection');

class Client {
  constructor(configParams, conn, vmArgs){
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
    this.cmdGen = new ShellCmd(systemUserName, conn.ip);
    this.connLog = new ConnectionLog(this.cmdGen, this.logPath, conn.id, true);
  }

  async sendBenchDir () {
    const scp = this.cmdGen.getScp(true, 'benchmarker', this.systemRemoteWorkDir);
    await exec(scp);
  }

  async cleanPreviousResults () {
    const rm = ShellCmd.getRm(true, this.resultPath);
    const ssh = this.cmdGen.getSsh(rm);
    try {
      await exec(ssh);
    } catch(err){
      if(err.code === 1){
        logger.info(`no previous results are found on ${this.conn.ip}`);
      }else{
        throw Error(err.stderr);
      }
    }

    async pull_csv()
  }

  async start(action) {
    logging.info(`starting client ${this.conn.id}`);
    // [clientId] [action]
    const progArgs = `${conn.id} ${action}`;
    const runJar = ShellCmd.getJavaVersion(
      this.javaBin,
      this.vmArgs,
      this.jarPath,
      progArgs,
      this.logPath
    );
    const ssh = this.cmdGen.getSsh(runJar);
    logger.info(`client ${this.conn.id} is running`);
    await exec(ssh);
  }

  async checkForFinished(action) {
    const keyword = this._getExpectedMsgFromAction(action);
    try {
      await this.checkForError();
      await this.connLog.grepLog(keyword);
      return true;
    } catch(err){
      if(err.code === 1){
        return false;
      }
      throw Error(err.stderr);
    }
  }

  async checkForError() {
    await this.connLog.grepError('Exception');
    await this.connLog.grepError('error');
    await this.connLog.grepError('SEVERE');
  }

  _getExpectedMsgFromAction(action){
    switch(action){
      case Action.benchmarking:
        return 'benchmark process finished';
      case Action.loading:
        return 'loading procedure finished';
      default:
        throw Error('no action');
    }
  }

  async pullCsv(dest) {
    const grepCsv = ShellCmd.getGrepCsv(this.resultPath, this.conn.id);
    const ssh = this.cmdGen.getSsh(grepCsv);
    
    try {
      const { stdout } = await exec(ssh);
      return stdout;
    } catch(err) {
      if(err.code === 1){
        throw(`cannot find the csv file on ${this.conn.ip}`);
      }
      throw(err.stderr);
    }
  }

  async getTotalThroughput() {

  }
}

module.exports = Client;
function Client (config, connection_info, vm_args) {
  this.config = config;
  this.connection_info = connection_info;
  this.vm_args = vm_args;

  this.result_path = config.system.remote_work_dir + '/results';
  this.id = connection_info.id;
  this.ip = connection_info.ip;
  this.jar_path = config.system.remote_work_dir + '/benchmarker/client.jar';
  this.log_path = config.system.remote_work_dir + '/client-' + connection_info.id + '.log';
  this.remote_java_bin = config.system.remote_work_dir + '/' + config.jdk.dir_name + '/bin/java';

  this.send_bench_dir = async function () {
    await command.asyncScpTo(true, this.config.system.user_name, this.connection_info.ip, 'benchmarker',
      this.config.system.remote_work_dir);
  };

  this.clean_previous_results = async function () {
    cmd = 'rm -r ' + this.result_path;
    bool = await command.asyncSSh(this.config.system.user_name, this.connection_info.ip, cmd);
    if (!bool) { await console.log('No previous results are found on ' + this.connection_info.ip); }
  };

  this.start = async function (action) {
    await console.log('Starting client ' + this.id + '...');
    // [client id] [action]
    prog_args = this.id + ' ' + action;
    cmd = `'${this.remote_java_bin} ${this.vm_args} -jar ${this.jar_path} ${prog_args} > ${this.log_path} 2>&1 &'`;
    await command.asyncSSh(this.config.system.user_name, this.connection_info.ip, cmd);
    await console.log('Client ' + this.id + ' is running.');
  };

  this.check_for_finished = async function (action) {
    keyword = '';
    if (action == con_com.Action.loading) { keyword = 'loading procedure finished.'; } else if (action == con_com.Action.Benchmarking) { keyword = 'benchmark process finished.'; }

    await this.check_for_error();
    return await this.grep_log(keyword);
  };
  this.check_for_error = async function () {
    if (await this.grep_log('Exception')) { throw new Error('Server ' + this.id + ' error: ' + output); }

    if (await this.grep_log('error')) { throw new Error('Server ' + this.id + ' error: ' + output); }

    if (await this.grep_log('SEVERE')) { throw new Error('Server ' + this.id + ' error: ' + output); }
  };

  this.grep_log = async function (keyword) {
    cmd = 'grep \\\'' + keyword + '\\\' ' + this.log_path;
    // console.log(cmd);
    bool = await command.asyncSSh(this.config.system.user_name, this.connection_info.ip, cmd);
    return bool;
  };
}
