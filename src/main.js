require('colors');
const process = require('process');
const Config = require('./config');
const logger = require('./logger');
const initEnv = require('./command/init-env');
const load = require('./command/load');

// Load parameters from config
const configPath = '../config.toml';
const config = new Config(configPath);
const params = config.getParams();

async function main (argv) {
  switch (argv[2]) {
  case 'init_env':
    try {
      await initEnv.execute(params, argv);
      logger.info('the environment has been initialized'.green);
    } catch (err) {
      // this try catch block is used to color the error message only
      logger.error(err.message.red);
    }
    break;
  case 'load':
    await load.execute(config, argv);
    logger.info('data has been loaded');
    break;

  default:
    logger.info('command is not found');
    break;
  }
}

main(process.argv);
