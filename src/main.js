const process = require('process');

const logger = require('./logger');
const initEnv = require('./subcommand/init-env');
const load = require('./subcommand/load');


function main (argv) {
  switch (argv[2]) {
  case 'init_env':
    initEnv.execute(argv);
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
