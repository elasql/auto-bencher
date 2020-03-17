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

  getParam () {
    return {
      dbDir: this._DbDir(),
      serverJarPath: this._ServerJarPath(),
      clientJarPath: this._ClientJarPath(),
      javaBin: this._JavaBin(),
      jdkPackagePath: this._JdkPackagePath(),
      jdkPackageName: this._JdkPackageName(),
      jdkDir: this._JdkDir(),
      involvedMachines: this._InvolvedMachines(),
      systemUserName: this._SystemUserName(),
      systemRemoteWorkDir: this._SystemRemoteWorkDir(),
      resultDir: this._ResultDir(),
      sequencer: this._Sequencer(),
      clients: this._Clients(),
      servers: this._Servers()
    };
  }

  /*
    return a string of database directory
  */
  _DbDir () {
    return this._SystemRemoteWorkDir() + '/' + databases;
  }

  /*
    return a string of server jar path
  */
  _ServerJarPath () {
    return this._SystemRemoteWorkDir() + '/' + serverJar;
  }

  /*
    return a string of client jar path
  */
  _ClientJarPath () {
    return this._SystemRemoteWorkDir() + '/' + clientJar;
  }

  /*
    return a string of java/bin path
  */
  _JavaBin () {
    return this._SystemRemoteWorkDir() + '/' + this._JdkDir() + '/' + javaBin;
  }

  /*
    return a string of jdk package path
  */
  _JdkPackagePath () {
    if (!Object.prototype.hasOwnProperty.call(this.config, jdk)) {
      throw new Error(`config has no property - ${jdk}`);
    }

    if (!Object.prototype.hasOwnProperty.call(this.config[jdk], packagePath)) {
      throw new Error(`config.${jdk} has no property - ${packagePath}`);
    }

    return this.config[jdk][packagePath];
  }

  /*
        return a string of jdk package file name
    */
  _JdkPackageName () {
    return this._JdkPackagePath().split('/').pop();
  }

  /*
        return a string of jdk directory name
    */
  _JdkDir () {
    if (!Object.prototype.hasOwnProperty.call(this.config, jdk)) {
      throw new Error(`config has no property - ${jdk}`);
    }

    if (!Object.prototype.hasOwnProperty.call(this.config[jdk], dirName)) {
      throw new Error(`config.${dirName} has no property - ${dirName}`);
    }

    return this.config[jdk][dirName];
  }

  /*
        return ab array of IP of involved machines
    */
  _InvolvedMachines () {
    return Object.values(this._Machines()).flat();
  }

  _Machines () {
    if (!Object.prototype.hasOwnProperty.call(this.config, machines)) {
      throw new Error(`config has no property - ${machines}`);
    }

    return this.config[machines];
  }

  /*
        return a string of system user name
    */
  _SystemUserName () {
    if (!Object.prototype.hasOwnProperty.call(this.config, system)) {
      throw new Error(`config has no property - ${system}`);
    }

    if (!Object.prototype.hasOwnProperty.call(this.config[system], userName)) {
      throw new Error(`config.${system} has no property - ${userName}`);
    }

    return this.config[system][userName];
  }

  /*
        return a string of system remote work directory
    */
  _SystemRemoteWorkDir () {
    if (!Object.prototype.hasOwnProperty.call(this.config, system)) {
      throw new Error(`config has no property - ${system}`);
    }

    if (!Object.prototype.hasOwnProperty.call(this.config[system], remoteWorkDir)) {
      throw new Error(`config.${system} has no property - ${remoteWorkDir}`);
    }

    return this.config[system][remoteWorkDir];
  }

  /*
    return a string of result directory
  */
  _ResultDir () {
    return this._SystemRemoteWorkDir() + '/' + results;
  }

  _Sequencer () {
    const mchns = this._Machines();
    if (!Object.prototype.hasOwnProperty.call(mchns, sequencer)) {
      throw new Error(`config.${machines} has no property - ${sequencer}`);
    }
    return mchns[sequencer][0];
  }

  _Clients () {
    const mchns = this._Machines();
    if (!Object.prototype.hasOwnProperty.call(mchns, clients)) {
      throw new Error(`config.${machines} has no property - ${clients}`);
    }
    return mchns[clients];
  }

  _Servers () {
    const mchns = this._Machines();
    if (!Object.prototype.hasOwnProperty.call(mchns, servers)) {
      throw new Error(`config.${machines} has no property - ${servers}`);
    }
    return mchns[servers];
  }
}

module.exports = Config;
