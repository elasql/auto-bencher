const fs = require('fs');

const logger = require('../logger');
const Connection = require('../remote/connection');

// const { args } = require('../args');
const { join } = require('../utils');
const { getVmArgs } = require('./vmargs');
const { ls, cp } = require('../actions/local-actions');

const {
  genPropertiestMap,
  overrideProperties,
  setPaths,
  setConnectionsProperties,
  isStandAloneMode,
  outputToFile
} = require('./properties');

const BENCH_DIR = 'benchmarker';
const PROP_DIR = 'props';
const JAR_DIR = 'jars';

async function prepareBenchEnv (configParam, benchParam, systemConn, args) {
  logger.info('preparing benchmark environment');

  createBenchDir();

  // copy the jar files to the benchmark directory
  await copyJars(benchParam, args);

  const propMap = genPropertiestMap(args.propDir);
  applyParameters(propMap, configParam, benchParam, systemConn);

  const propDir = join(BENCH_DIR, PROP_DIR);
  outputToFile(propMap, propDir);

  const { systemRemoteWorkDir } = configParam;
  const remotePropDir = join(systemRemoteWorkDir, propDir);

  return getVmArgs(propMap, remotePropDir);
}

function createBenchDir () {
  if (!fs.existsSync(BENCH_DIR)) {
    fs.mkdirSync(BENCH_DIR);
  }
}

function applyParameters (propMap, configParam, benchParam, systemConn) {
  const { dbDir, resultDir } = configParam;
  const { seqConn, serverConns, clientConns } = systemConn;

  overrideProperties(propMap, benchParam);
  setPaths(propMap, dbDir, resultDir);
  systemConn.isStandAlone = isStandAloneMode(propMap);

  const hasSequencer = seqConn !== undefined;
  setConnectionsProperties(
    propMap,
    Connection.getView(serverConns.concat([seqConn])),
    Connection.getView(clientConns),
    hasSequencer
  );
}

async function copyJars (benchParam, args) {
  await Promise.all(getJars(benchParam, args).map(jarPath =>
    lsAndCopy(jarPath))
  );
}

async function lsAndCopy (jarPath) {
  await ls(jarPath);
  await cp(jarPath, BENCH_DIR);
}

function getJars (benchParam, args) {
  const jarDir = benchParam.getStrValue('auto_bencher', 'jar_dir');
  const fileNames = ['server.jar', 'client.jar'];

  return fileNames.map(fileName => join(JAR_DIR, jarDir, fileName));
}

module.exports = {
  prepareBenchEnv
};
