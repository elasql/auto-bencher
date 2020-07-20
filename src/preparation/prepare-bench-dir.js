const fs = require('fs');

const logger = require('../logger');
const Connection = require('../remote/connection');

const { args } = require('../args');
const { join } = require('../utils');
const { getVmArgs } = require('./vmargs');
const { ls, cp } = require('../actions/local-actions');

const {
  genPropertiestMap,
  overrideProperties,
  setPaths,
  setConnectionsProperties,
  setElasqlProperties,
  outputToFile
} = require('./properties');

const BENCH_DIR = 'benchmarker';
const PROP_DIR = 'props';

async function prepareBenchEnv (configParam, benchParam, systemConn) {
  logger.info('preparing benchmark environment');

  createBenchDir();

  // copy the jar files to the benchmark directory
  try {
    await copyJars(benchParam, args);
  } catch (err) {
    throw Error(err.message);
  }

  const propMap = genPropertiestMap(args.propDir[0]);
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
  setConnectionsProperties(
    propMap,
    Connection.getView(serverConns.concat([seqConn])),
    Connection.getView(clientConns),
    seqConn !== undefined
  );
  setElasqlProperties(propMap, serverConns.length.toString());
}

async function copyJars (benchParam, args) {
  await Promise.all(getJars(benchParam, args).map(jarPath => {
    lsAndCopy(jarPath);
  })
  );
}

async function lsAndCopy (jarPath) {
  await ls(jarPath);
  await cp(jarPath, BENCH_DIR);
}

function getJars (benchParam, args) {
  const jarDir = benchParam.getStrValue('auto_bencher', 'jar_dir');
  const fileNames = ['server.jar', 'client.jar'];

  return fileNames.map(fileName => join(args.jarsDir[0], jarDir, fileName));
}

module.exports = {
  prepareBenchEnv
};