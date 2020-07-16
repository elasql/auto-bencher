require('colors');
const Config = require('./preparation/config');
const logger = require('./logger');
const initEnv = require('./command/init-env');
const load = require('./command/load');
const { loadToml } = require('./utils');
const { args } = require('./args');

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
      throw Error(err.message);
    }
    break;

  case 'load':
    try {
      await load.execute(configParam, args);
    } catch (err) {
      logger.error(err.message.red);
      throw Error(err.message);
    }
    break;

  default:
    logger.info('command is not found');
    break;
  }
}

main(args);
