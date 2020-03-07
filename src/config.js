// string constant
const jdk = 'jdk';
const system = 'system';
const dirName = 'dir_name';
const machines = 'machines';
const userName = 'user_name';
const packagePath = 'package_path';
const remoteWorkDir = 'remote_work_dir';
const databases = 'databases';
const serverJar = 'benchmarker/server.jar';
const clientJar = 'benchmarker/client.jar';
const javaBin = 'bin/java';
const results = 'results';
const sequencer = 'sequencer';
const clients = 'clients';
const servers = 'servers';

class Config {
  constructor (tomlObject) {
    this.config = tomlObject;
  }

  getParams () {
    return {
      dbDir: this._getDbDir(),
      serverJarPath: this._getServerJarPath(),
      clientJarPath: this._getClientJarPath(),
      javaBin: this._getJavaBin(),
      jdkPackagePath: this._getJdkPackagePath(),
      jdkPackageName: this._getJdkPackageName(),
      jdkDir: this._getJdkDir(),
      involvedMachines: this._getInvolvedMachines(),
      systemUserName: this._getSystemUserName(),
      systemRemoteWorkDir: this._getSystemRemoteWorkDir(),
      resultDir: this._getResultDir(),
      sequencer: this._getSequencer(),
      clients: this._getClients(),
      servers: this._getServers()
    };
  }

  /*
    return a string of database directory
  */
  _getDbDir () {
    return this._getSystemRemoteWorkDir() + '/' + databases;
  }

  /*
    return a string of server jar path
  */
  _getServerJarPath () {
    return this._getSystemRemoteWorkDir() + '/' + serverJar;
  }

  /*
    return a string of client jar path
  */
  _getClientJarPath () {
    return this._getSystemRemoteWorkDir() + '/' + clientJar;
  }

  /*
    return a string of java/bin path
  */
  _getJavaBin () {
    return this._getSystemRemoteWorkDir() + '/' + this._getJdkDir() + '/' + javaBin;
  }

  /*
    return a string of jdk package path
  */
  _getJdkPackagePath () {
    if (!Object.prototype.hasOwnProperty.call(this.config, jdk)) {
      throw new Error(`config has no property ${jdk}`);
    }

    if (!Object.prototype.hasOwnProperty.call(this.config[jdk], packagePath)) {
      throw new Error(`config.${jdk} has no property ${packagePath}`);
    }

    return this.config[jdk][packagePath];
  }

  /*
        return a string of jdk package file name
    */
  _getJdkPackageName () {
    return this._getJdkPackagePath().split('/').pop();
  }

  /*
        return a string of jdk directory name
    */
  _getJdkDir () {
    if (!Object.prototype.hasOwnProperty.call(this.config, jdk)) {
      throw new Error(`config has no property ${jdk}`);
    }

    if (!Object.prototype.hasOwnProperty.call(this.config[jdk], dirName)) {
      throw new Error(`config.${dirName} has no property ${dirName}`);
    }

    return this.config[jdk][dirName];
  }

  /*
        return ab array of IP of involved machines
    */
  _getInvolvedMachines () {
    return Object.values(this._getMachines()).flat();
  }

  _getMachines () {
    if (!Object.prototype.hasOwnProperty.call(this.config, machines)) {
      throw new Error(`config has no property ${machines}`);
    }

    return this.config[machines];
  }

  /*
        return a string of system user name
    */
  _getSystemUserName () {
    if (!Object.prototype.hasOwnProperty.call(this.config, system)) {
      throw new Error(`config has no property ${system}`);
    }

    if (!Object.prototype.hasOwnProperty.call(this.config[system], userName)) {
      throw new Error(`config.${system} has no property ${userName}`);
    }

    return this.config[system][userName];
  }

  /*
        return a string of system remote work directory
    */
  _getSystemRemoteWorkDir () {
    if (!Object.prototype.hasOwnProperty.call(this.config, system)) {
      throw new Error(`config has no property ${system}`);
    }

    if (!Object.prototype.hasOwnProperty.call(this.config[system], remoteWorkDir)) {
      throw new Error(`config.${system} has no property ${remoteWorkDir}`);
    }

    return this.config[system][remoteWorkDir];
  }

  /*
    return a string of result directory
  */
  _getResultDir () {
    return this._getSystemRemoteWorkDir() + '/' + results;
  }

  _getSequencer () {
    const mchns = this._getMachines();
    if (!Object.prototype.hasOwnProperty.call(mchns, sequencer)) {
      throw new Error(`config.${machines} has no property ${sequencer}`);
    }
    return mchns[sequencer][0];
  }

  _getClients () {
    const mchns = this._getMachines();
    if (!Object.prototype.hasOwnProperty.call(mchns, clients)) {
      throw new Error(`config.${machines} has no property ${clients}`);
    }
    return mchns[clients];
  }

  _getServers () {
    const mchns = this._getMachines();
    if (!Object.prototype.hasOwnProperty.call(mchns, servers)) {
      throw new Error(`config.${machines} has no property ${servers}`);
    }
    return mchns[servers];
  }
}

module.exports = Config;
