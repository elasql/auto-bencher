const logger = require('../logger');
const { loadToml } = require('../utils');
const { normalLoad } = require('../benchmark-parameter');

const { run } = require('./runner');
const { Action } = require('../connection/connection');

function execute (configParam, argv) {
  const dbName = argv[3];
  const paramPath = argv[4];

  logger.info('preparing for loading testbed into ' + dbName.green);
  logger.info(`using parameter file '${paramPath}'`);

  const toml = loadToml(paramPath);
  const benchParams = normalLoad(toml);

  run(configParam, benchParams[0], dbName, Action.loading, null);

  logger.info(`loading testbed finished`);
}

module.exports = {
  execute
};
