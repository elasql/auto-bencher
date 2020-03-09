require('colors');
const process = require('process');
const Config = require('./config');
const logger = require('./logger');
const initEnv = require('./command/init-env');
const load = require('./command/load');
const { loadToml } = require('./utils');

// Load parameters from config
// TODO: Let user input config file path
const configPath = './config.toml';
const configToml = loadToml(configPath);
const config = new Config(configToml);
const configParam = config.getParam();

async function main (argv) {
  switch (argv[2]) {
  case 'init_env':

    try {
      await initEnv.execute(configParam, argv);
    } catch (err) {
      // this try catch block is used to color the error message only
      logger.error(err.message.red);
    }
    break;

  case 'load':
    try {
      await load.execute(configParam, argv);
    } catch (err) {
      logger.error(err.message.red);
    }
    break;

  default:
    logger.info('command is not found');
    break;
  }
}

main(process.argv);
