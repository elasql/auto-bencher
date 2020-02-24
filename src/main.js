const process = require('process');
const fs = require('fs');
const toml = require('toml');
const {createLogger, format, transports} = require('winston');

const initEnv = require('./subcommand/init-env');
const load = require('./subcommand/load');

// create logger
const logger = createLogger({
  level: 'info',
  // TODO: we can add transports.File
  transports: [
    new transports.Console(),
  ]
});

// load config
const configPath = '../config.toml';
const config = toml.parse(fs.readFileSync(configPath, 'utf-8'));

function main (argv) {
  switch (argv[2]) {
  case 'init_env':
    initEnv.execute(config, argv);
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
