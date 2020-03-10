const fs = require('fs');
const path = require('path');
const logger = require('./logger');
const bp = require('./benchmark-parameter');
const ShellCmd = require('./shell-cmd');
const { exec } = require('./child-process');
const { PropertiesFileMap } = require('./properties');

const BENCH_DIR = 'benchmarker';
const PROP_DIR = 'props';

async function prepareBenchDir (configParam, benchParam, systemConn, args) {
  logger.info('preparing the benchmarker directory...');

  // ensure the existance of the benchmarker directory
  if (!fs.existsSync(BENCH_DIR)) {
    fs.mkdirSync(BENCH_DIR);
  }

  // copy the jar files to the benchmark directory
  await copyJars(benchParam);

  // read the default Properties
  const defaultPropDir = args.propDir;
  const pfm = new PropertiesFileMap(defaultPropDir);

  // apply the parameters
  applyParameters(pfm, configParam, benchParam, systemConn);

  // generate the properties files to the benchmark dir
  const propDir = path.posix.join(BENCH_DIR, PROP_DIR);
  pfm.outputDir(propDir);

  const { systemRemoteWorkDir } = configParam;
  const remotePropDir = path.posix.join(systemRemoteWorkDir, propDir);
  return pfm.getVmArgs(remotePropDir);
}

function applyParameters (pfm, configParam, benchParam, systemConn) {
  const { seqConn, serverConns, clientConns } = systemConn;
  pfm.overrideProperties(benchParam);
  pfm.setPaths(configParam);
  pfm.setConnectionsProperties(seqConn, serverConns, clientConns);
  pfm.setElasqlProperties(serverConns.length);
}

async function copyJars (benchParam, args) {
  await Promise.all(getJars(benchParam, args).map(jarPath => {
    lsAndCopy(jarPath);
  })
  );
}

async function lsAndCopy (jarPath) {
  const ls = ShellCmd.getLs(jarPath);
  await exec(ls);

  const cp = ShellCmd.getCp(false, jarPath, BENCH_DIR);
  await exec(cp);
}

function getJars (benchParam, args) {
  const jarDir = bp.getStrValue(benchParam, 'auto_bencher', 'jar_dir');
  const fileNames = ['server.jar', 'client.jar'];

  return fileNames.map(fileName => path.posix.join(args.jarsDir, jarDir, fileName));
}

module.exports = {
  prepareBenchDir
};
