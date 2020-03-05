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
      resultPath: this._getResultPath(),
      sequencer: this._getSequencer()
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
    if (!Object.prototype.hasOwnProperty.call(this.config, machines)) {
      throw new Error(`config has no property ${machines}`);
    }

    return Object.values(this.config[machines]).flat();
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
    return a string of result path
  */
  _getResultPath () {
    return this._getSystemRemoteWorkDir() + '/' + results;
  }

  _getSequencer () {
    if (!Object.prototype.hasOwnProperty.call(this.config, machines)) {
      throw new Error(`config has no property ${machines}`);
    }
    if (!Object.prototype.hasOwnProperty.call(this.config[machines], sequencer)) {
      throw new Error(`config.${machines} has no property ${sequencer}`);
    }
    return this.config[machines][sequencer][0];
  }
}

module.exports = Config;
