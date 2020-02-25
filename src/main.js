
const process = require('process');
const Config = require('../config');
const logger = require('./logger');
const initEnv = require('./subcommand/init-env');
const load = require('./subcommand/load');

// Load parameters from config
const configPath = '../config.toml';
const config = new Config(configPath);
const params = config.getParams();

function main (argv) {
  switch (argv[2]) {
  case 'init_env':
    initEnv.execute(params, argv);
    logger.info('the environment has been initialized');
    break;

  case 'load':
    load.execute(config, argv);
    logger.info('data has been loaded');
    break;

  default:
    logger.info('command is not found');
    break;
  }
}

main(process.argv);
