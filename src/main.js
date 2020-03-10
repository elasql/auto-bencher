require('colors');
const Config = require('./config');
const logger = require('./logger');
const initEnv = require('./command/init-env');
const load = require('./command/load');
const { loadToml } = require('./utils');
const args = require('./args');

// Load parameters from config
// TODO: Let user input config file path
const configPath = './config.toml';
const configToml = loadToml(configPath);
const config = new Config(configToml);
const configParam = config.getParam();

async function main (args) {
  switch (args.mode) {
  case 'init':

    try {
      await initEnv.execute(configParam);
    } catch (err) {
      // this try catch block is used to color the error message only
      logger.error(err.message.red);
    }
    break;

  case 'load':
    try {
      await load.execute(configParam, args);
    } catch (err) {
      logger.error(err.message.red);
    }
    break;

  default:
    logger.info('command is not found');
    break;
  }
}

main(args);
