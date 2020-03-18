const path = require('path');
// const { args } = require('../args');
const { loadSettings } = require('../utils');
const Properties = require('./properties');
const Parameter = require('./parameter');
// function prepare (configParam, benchParam, systemConn) {

// }

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

// function applyParameters (propMap, configParam, benchParam, systemConn) {
//   const { dbDir, resultDir } = configParam;
//   const { seqConn, serverConns, clientConns } = systemConn;

//   overrideProperties(propMap, benchParam);
//   setPaths(propMap, dbDir, resultDir);
// }

// function setPaths (propMap, dbDir, resultDir) {
//   propMap.vanilladb.set('org.vanilladb.core.storage.file.FileMgr.DB_FILES_DIR', dbDir);
//   propMap.vanillabench.set('org.vanilladb.bench.StatisticMgr.OUTPUT_DIR', resultDir);
// }

// // const fs = require('fs');
// // const path = require('path');
// // const logger = require('./logger');
// // const bp = require('./benchmark-parameter');
// // const ShellCmd = require('./shell-cmd');
// // const { exec } = require('./child-process');
// // const { PropertiesFileMap } = require('./properties');

// // const BENCH_DIR = 'benchmarker';
// // const PROP_DIR = 'props';

// // async function prepareBenchDir (configParam, benchParam, systemConn, args) {
// //   logger.info('preparing the benchmarker directory...');

// //   // ensure the existance of the benchmarker directory
// //   if (!fs.existsSync(BENCH_DIR)) {
// //     fs.mkdirSync(BENCH_DIR);
// //   }

// //   // copy the jar files to the benchmark directory
// //   await copyJars(benchParam, args);

// //   // read the default Properties
// //   const defaultPropDir = args.propDir[0];
// //   const pfm = new PropertiesFileMap(defaultPropDir);

// //   // apply the parameters
// //   applyParameters(pfm, configParam, benchParam, systemConn);

// //   // generate the properties files to the benchmark dir
// //   const propDir = path.posix.join(BENCH_DIR, PROP_DIR);
// //   pfm.outputDir(propDir);

// //   const { systemRemoteWorkDir } = configParam;
// //   const remotePropDir = path.posix.join(systemRemoteWorkDir, propDir);
// //   return pfm.getVmArgs(remotePropDir);
// // }

// // function applyParameters (pfm, configParam, benchParam, systemConn) {
// //   const { seqConn, serverConns, clientConns } = systemConn;
// //   pfm.overrideProperties(benchParam);
// //   pfm.setPaths(configParam);
// //   pfm.setConnectionsProperties(seqConn, serverConns, clientConns);
// //   pfm.setElasqlProperties(serverConns.length);
// // }

// // async function copyJars (benchParam, args) {
// //   await Promise.all(getJars(benchParam, args).map(jarPath => {
// //     lsAndCopy(jarPath);
// //   })
// //   );
// // }

// // async function lsAndCopy (jarPath) {
// //   const ls = ShellCmd.getLs(jarPath);
// //   await exec(ls);

// //   const cp = ShellCmd.getCp(false, jarPath, BENCH_DIR);
// //   await exec(cp);
// // }

// // function getJars (benchParam, args) {
// //   const jarDir = bp.getStrValue(benchParam, 'auto_bencher', 'jar_dir');
// //   const fileNames = ['server.jar', 'client.jar'];

// //   return fileNames.map(fileName => path.posix.join(args.jarsDir[0], jarDir, fileName));
// // }

// // module.exports = {
// //   prepareBenchDir
// // };

module.exports = {
  genPropertiestMap,
  overrideProperties
};
