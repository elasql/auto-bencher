const _ = require('lodash');
const fs = require('fs');
const path = require('path');
const javaProperties = require('java-properties');
const { loadSettings } = require('../utils');

// const { Connection } = require('../connection/connection');

class Properties {
  constructor (id, propertiesPath) {
    if (typeof id !== 'string') {
      throw Error('id should be type of string');
    }
    this.id = id;
    this.fileName = propertiesPath;
    this.baseName = path.basename(propertiesPath, '.properties');
    this.properties = _.cloneDeep(javaProperties.of(propertiesPath).objs);
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

  outputToFile (outputDir) {
    if (!fs.existsSync(outputDir)) {
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

//   overrideProperties (benchParam) {
//     Object.keys(benchParam).map(paramFile => {
//       if (!(paramFile === 'auto_bencher')) {
//         const properties = benchParam[paramFile];
//         Object.keys(properties).map(prop => {
//           // pass filename with .properties
//           this.set(paramFile, prop, properties[prop]);
//         });
//       }
//     });
//   }

//   setPaths (configParam) {
//     const { dbDir, resultDir } = configParam;
//     this.set(
//       'vanilladb',
//       'org.vanilladb.core.storage.file.FileMgr.DB_FILES_DIR',
//       dbDir
//     );

//     this.set(
//       'vanillabench',
//       'org.vanilladb.bench.StatisticMgr.OUTPUT_DIR',
//       resultDir
//     );
//   }

//   // TODO: add test cases !!!
//   setConnectionsProperties (sequencer, servers, clients) {
//     this.set(
//       'vanilladbcomm',
//       'org.vanilladb.comm.server.ServerAppl.SERVER_VIEW',
//       Connection.getView(servers.concat([sequencer]))
//     );

//     this.set(
//       'vanilladbcomm',
//       'org.vanilladb.comm.client.ClientAppl.CLIENT_VIEW',
//       Connection.getView(clients)
//     );

//     this.set(
//       'vanilladbcomm',
//       'org.vanilladb.comm.server.ServerAppl.STAND_ALONE_SEQUENCER',
//       sequencer ? 'true' : 'false'
//     );
//   }

//   setElasqlProperties (serverCount) {
//     this.set(
//       'elasql',
//       'org.elasql.storage.metadata.PartitionMetaMgr.NUM_PARTITIONS',
//       String(serverCount)
//     );
//   }
// }

module.exports = {
  Properties,
  genPropertiestMap
};
