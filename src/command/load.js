const logger = require('../logger');
const { loadToml } = require('../utils');
const { normalLoad } = require('../preparation/parameter-loader');

const { run } = require('./runner');
const { Action } = require('../actions/remote-actions');

async function execute (configParam, args) {
  const dbName = args.dbName[0];
  const paramPath = args.paramPath[0];

  logger.info('preparing for loading testbed into ' + dbName.green);
  logger.info(`using parameter file '${paramPath}'`);
  const toml = loadToml(paramPath);
  const benchParams = normalLoad(toml);

  await run(configParam, benchParams[0], args, dbName, Action.loading, null);

  logger.info(`loading testbed finished`);
}

module.exports = {
  execute
};
