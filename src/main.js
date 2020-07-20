require('colors');

const { args } = require('./args');
const { loadToml } = require('./utils');

const logger = require('./logger');
const Config = require('./preparation/config');

const load = require('./command/load');
const pull = require('./command/pull');
const initEnv = require('./command/init-env');
const benchmark = require('./command/benchmark');
const executeAll = require('./command/execute-all');

// Load parameters from config
const configToml = loadToml(args.configPath[0]);
const configParam = new Config(configToml).getParam();

async function main (args) {
  switch (args.mode) {
  case 'init':
    try {
      await initEnv.execute(configParam);
    } catch (err) {
      // this try catch block is used to color the error message only
      logger.error(err.message.red);
      process.exit(1);
    }
    break;

  case 'load':
    try {
      await load.execute(configParam, args);
    } catch (err) {
      logger.error(err.message.red);
      process.exit(1);
    }
    break;

  case 'benchmark':
    try {
      await benchmark.execute(configParam, args);
    } catch (err) {
      logger.error(err.message.red);
      process.exit(1);
    }
    break;

  case 'pull':
    try {
      await pull.execute(configParam, args);
    } catch (err) {
      logger.error(err.message.red);
      process.exit(1);
    }
    break;

  case 'exec':
    try {
      await executeAll.execute(configParam, args);
    } catch (err) {
      logger.error(err.message.red);
      process.exit(1);
    }
    break;

  default:
    logger.info('command is not found');
    break;
  }
}

main(args);
