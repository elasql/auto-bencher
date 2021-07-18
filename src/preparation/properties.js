const _ = require('lodash');
const fs = require('fs');
const path = require('path');

const Parameter = require('./parameter');
const javaProperties = require('java-properties');

const {
  join,
  loadSettings
} = require('../utils');

const EXTENSION = '.properties';

class Properties {
  constructor (id, propertiesPath) {
    if (typeof id !== 'string') {
      throw Error('id should be type of string');
    }
    this.id = id;
    this.propertiesPath = propertiesPath;
    this.baseName = path.basename(propertiesPath, EXTENSION);
    this.fileName = path.basename(propertiesPath);
    this.properties = _.cloneDeep(javaProperties.of(propertiesPath).objs);
  }

  get (property) {
    if (!Object.prototype.hasOwnProperty.call(this.properties, property)) {
      throw Error(`cannot find the property: ${property} in ${this.propertiesPath}`);
    }

    return this.properties[property];
  }

  set (property, value) {
    if (!Object.prototype.hasOwnProperty.call(this.properties, property)) {
      throw Error(`cannot find the property: ${property} in ${this.propertiesPath}`);
    }
    if (typeof value !== 'string') {
      throw Error(`value ${value} is not in string type`);
    }
    this.properties[property] = value;
  }

  outputToFile (outputDir, checkDir) {
    if (checkDir && !fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir);
    }

    const filePath = join(outputDir, this.fileName);
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

// Return a map that the key is a propertiesFile name and the value is an Properties object
function genPropertiestMap (propertiesDir) {
  const map = {};
  const settings = loadSettings(join(propertiesDir, 'settings.json'));

  settings.map(setting => {
    const filePath = join(propertiesDir, setting.filename);
    const prop = new Properties(setting.id, filePath);
    map[prop.baseName] = prop;
  });
  return map;
}

function overrideProperties (propMap, benchParam) {
  if (!(benchParam instanceof Parameter)) {
    throw Error('benchParam is not an instance of Parameter');
  }
  const param = benchParam.param;
  Object.keys(param).map(paramFile => {
    if (paramFile !== 'auto_bencher') {
      const userProperties = param[paramFile];

      Object.keys(userProperties).map(key => {
        propMap[paramFile].set(key, userProperties[key]);
      });
    }
  });
};

function setPaths (propMap, dbDir, resultDir) {
  propMap.vanilladb.set('org.vanilladb.core.storage.file.FileMgr.DB_FILES_DIR', dbDir);
  propMap.vanillabench.set('org.vanilladb.bench.StatisticMgr.OUTPUT_DIR', resultDir);
};

function setConnectionsProperties (propMap, serverView, clientView, hasSequencer) {
  if (typeof hasSequencer !== 'boolean') {
    throw Error('hasSequencer should be type of boolean');
  }

  propMap.vanillacomm.set(
    'org.vanilladb.comm.view.ProcessView.SERVER_VIEW',
    serverView
  );

  propMap.vanillacomm.set(
    'org.vanilladb.comm.view.ProcessView.CLIENT_VIEW',
    clientView
  );
}

function isStandAloneMode (propMap) {
  return propMap.elasql.properties['org.elasql.server.Elasql.ENABLE_STAND_ALONE_SEQUENCER'] === 'true';
}

function outputToFile (propMap, dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath);
  }

  Object.values(propMap).map(prop => {
    prop.outputToFile(dirPath, false);
  });
}

module.exports = {
  Properties,
  genPropertiestMap,
  overrideProperties,
  setPaths,
  setConnectionsProperties,
  isStandAloneMode,
  outputToFile
};
