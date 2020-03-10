const logger = require('../logger');
const { loadToml } = require('../utils');
const { normalLoad } = require('../benchmark-parameter');

const { run } = require('./runner');
const { Action } = require('../connection/connection');

async function execute (configParam, argv) {
  if (!argv[3] || !argv[4]) {
    throw Error('please provide config path and parameter path');
  }
  const dbName = argv[3];
  const paramPath = argv[4];

  logger.info('preparing for loading testbed into ' + dbName.green);
  logger.info(`using parameter file '${paramPath}'`);

  const toml = loadToml(paramPath);
  const benchParams = normalLoad(toml);

  await run(configParam, benchParams[0], dbName, Action.loading, null);

  logger.info(`loading testbed finished`);
}

module.exports = {
  execute
};
