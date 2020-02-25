const fs = require('fs');
const toml = require('toml');

// string constant
const jdk = 'jdk';
const system = 'system';
const dirName = 'dir_name';
const machines = 'machines';
const userName = 'user_name';
const packagePath = 'package_path';
const remoteWorkDir = 'remote_work_dir';

class Config {
  constructor (configPath) {
    this.config = Config.loadConfig(configPath);
  }

  static loadConfig (configPath) {
    return toml.parse(fs.readFileSync(configPath, 'utf-8'));
  }

  getParams () {
    return {
      jdkPackagePath: this.getJdkPackagePath(),
      jdkPackageFileName: this.getJdkPackageFileName(),
      jdkDirName: this.getJdkDirName(),
      involvedMachines: this.getInvolvedMachines(),
      systemUserName: this.getSystemUserName(),
      systemRemoteWorkDir: this.getSystemRemoteWorkDir()
    };
  }

  /*
    return a string of jdk package path
    */
  getJdkPackagePath () {
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
  getJdkPackageFileName () {
    return this.getJdkPackagePath().split('/').pop();
  }

  /*
        return a string of jdk directory name
    */
  getJdkDirName () {
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
  getInvolvedMachines () {
    if (!Object.prototype.hasOwnProperty.call(this.config, machines)) {
      throw new Error(`config has no property ${machines}`);
    }

    return Object.values(this.config[machines]).flat();
  }

  /*
        return a string of system user name
    */
  getSystemUserName () {
    if (!Object.prototype.hasOwnProperty.call(this.config, system)) {
      throw new Error(`config has no property ${system}`);
    }

    if (!Object.prototype.hasOwnProperty.call(this.config[system], userName)) {
      throw new Error(`config has no property ${userName}`);
    }

    return this.config[system][userName];
  }

  /*
        return a string of system remote work directory
    */
  getSystemRemoteWorkDir () {
    if (!Object.prototype.hasOwnProperty.call(this.config, system)) {
      throw new Error(`config has no property ${system}`);
    }

    if (!Object.prototype.hasOwnProperty.call(this.config[system], remoteWorkDir)) {
      throw new Error(`config has no property ${remoteWorkDir}`);
    }

    return this.config[system][remoteWorkDir];
  }
}

module.exports = Config;
