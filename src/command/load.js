const logger = require('../logger');
const { loadToml } = require('../utils');
const { normalLoad } = require('../benchmark-parameter');
const path = require('path');

const { run } = require('./runner');
const { Action } = require('../connection/connection');

async function execute (configParam, args) {
  const dbName = args.dbName[0];
  const prepartion = args.prepartion[0];
  const paramPath = path.posix.join(prepartion, 'parameters', 'normal-load.toml');
  const defaultPropDir = path.posix.join(prepartion, 'properties');

  // should extract to a function
  logger.info('preparing for loading testbed into ' + dbName.green);
  logger.info(`using parameter file '${paramPath}'`);
  const toml = loadToml(paramPath);
  const benchParams = normalLoad(toml);

  await run(configParam, benchParams[0], defaultPropDir, dbName, Action.loading, null);

  logger.info(`loading testbed finished`);
}

module.exports = {
  execute
};
