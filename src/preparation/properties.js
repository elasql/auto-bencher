const _ = require('lodash');
const fs = require('fs');
const path = require('path');
const Parameter = require('./parameter');
const javaProperties = require('java-properties');
const { loadSettings } = require('../utils');

class Properties {
  constructor (id, propertiesPath) {
    if (typeof id !== 'string') {
      throw Error('id should be type of string');
    }
    this.id = id;
    this.fileName = propertiesPath;
    this.baseName = path.basename(propertiesPath) + '.properties';
    this.properties = _.cloneDeep(javaProperties.of(propertiesPath).objs);
  }

  get (property) {
    if (!Object.prototype.hasOwnProperty.call(this.properties, property)) {
      throw Error(`cannot find the property: ${property} in ${this.fileName}`);
    }

    return this.properties[property];
  }

  set (property, value) {
    if (!Object.prototype.hasOwnProperty.call(this.properties, property)) {
      throw Error(`cannot find the property: ${property} in ${this.fileName}`);
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

    const filePath = path.posix.join(outputDir, this.baseName);
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

// Return a map that key is fileName and value is Properties object
function genPropertiestMap (propertiesDir) {
  const map = {};
  const settings = loadSettings(path.posix.join(propertiesDir, 'settings.json'));

  settings.map(setting => {
    const filePath = path.posix.join(propertiesDir, setting.filename);
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

function setConnectionsProperties (propMap, serverView, clientView, isSequencer) {
  if (typeof isSequencer !== 'boolean') {
    throw Error('isSequencer should be type of boolean');
  }

  propMap.vanillacomm.set(
    'org.vanilladb.comm.view.ProcessView.SERVER_VIEW',
    serverView
  );

  propMap.vanillacomm.set(
    'org.vanilladb.comm.view.ProcessView.CLIENT_VIEW',
    clientView
  );

  propMap.vanillacomm.set(
    'org.vanilladb.comm.ProcessView.STAND_ALONE_SEQUENCER',
    // return string 'true' if there is a sequencer
    isSequencer ? 'true' : 'false'
  );
}

function setElasqlProperties (propMap, serverCount) {
  if (typeof serverCount !== 'string') {
    throw Error('serverCount should be type of string');
  }

  propMap.elasql.set(
    'org.elasql.storage.metadata.PartitionMetaMgr.NUM_PARTITIONS',
    serverCount
  );
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
  setElasqlProperties,
  outputToFile
};
