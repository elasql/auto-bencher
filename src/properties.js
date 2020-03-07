const fs = require('fs');
const path = require('path');
const javaProperties = require('java-properties');

class PropertiesFile {
  constructor (id, propertiesPath) {
    this.id = id;
    this.properties = { ...javaProperties.of(propertiesPath).objs };
    this.fileName = path.basename(propertiesPath, '.properties');
  }

  set (property, value) {
    if (!Object.prototype.hasOwnProperty.call(this.properties, property)) {
      throw Error(`cannot find the property: ${property} in ${this.fileName}.properties`);
    }
    if (typeof value !== 'string') {
      throw Error(`value ${value} is not in string type`);
    }
    this.properties[property] = value;
  }

  outputToFile (outputDir) {
    const filePath = path.posix.join(outputDir, this.fileName + '.properties');
    fs.writeFileSync(filePath, this.convertObjectToPropertiesText());
  }

  convertObjectToPropertiesText () {
    let text = '';

    Object.keys(this.properties).map(key => {
      text += key + '=' + this.properties[key] + '\n';
    });

    return text;
  }
}

class PropertiesFileMap {
  constructor (propertiesDir) {
    this.propertiesDir = propertiesDir;
    this.fileNameToPropertiesFileObject = this.genFileNameToPropertiesFileObjectMap();
  }

  genFileNameToPropertiesFileObjectMap () {
    const map = {};
    const settings = this.loadSettingsToObject();
    settings.map(setting => {
      const filePath = path.posix.join(this.propertiesDir, setting.filename);
      const pf = new PropertiesFile(setting.id, filePath);
      map[pf.fileName] = pf;
    });
    return map;
  }

  loadSettingsToObject () {
    const settingsPath = path.posix.join(this.propertiesDir, 'settings.json');
    const settings = fs.readFileSync(settingsPath);
    return JSON.parse(settings);
  }

  set (fileName, property, value) {
    if (!Object.prototype.hasOwnProperty.call(this.fileNameToPropertiesFileObject, fileName)) {
      throw Error(`cannot find properties file: ${fileName}`);
    }

    this.fileNameToPropertiesFileObject[fileName].set(property, value);
  }

  outputDir (dirPath) {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath);
    }

    Object.values(this.fileNameToPropertiesFileObject).map(pf => {
      pf.outputDir(dirPath);
    });
  }

  getVmArgs (propertiesDir) {
    let vmArgs = '';

    Object.values(this.fileNameToPropertiesFileObject).map(pf => {
      vmArgs += '-D ' + pf.id + '=' + path.posix.join(propertiesDir, pf.fileName + '.properties ');
    });

    // remove the last ' '
    return vmArgs.slice(0, vmArgs.length - 1);
  }

  overrideProperties (benchParam) {
    Object.keys(benchParam).map(paramFile => {
      if (!(paramFile === 'auto_bencher')) {
        const properties = benchParam[paramFile];
        Object.keys(properties).map(prop => {
          // pass filename with .properties
          this.set(paramFile, prop, properties[prop]);
        });
      }
    });
  }

  // TODO: add test cases
  setPaths (configParams) {
    const { dbDir, resultDir } = configParams;
    this.set(
      'vanilladb',
      'org.vanilladb.core.storage.file.FileMgr.DB_FILES_DIR',
      dbDir
    );

    this.set(
      'vanillabench',
      'org.vanilladb.bench.StatisticMgr.OUTPUT_DIR',
      resultDir
    );
  }
}

module.exports = {
  PropertiesFile,
  PropertiesFileMap
};
