const logger = require('../logger');
const { loadToml } = require('../utils');
const { normalLoad } = require('../benchmark-parameter');

async function execute (configParam, args) {
  const dbName = args.dbName[0];
  const paramPath = args.paramPath[0];
  const ignoreError = args.ignore;
  logger.debug(`dbName: ${dbName}, paramPath: ${paramPath}, ignoreError: ${ignoreError}`);

  logger.info(`preparing for running benchmarks...`);

  const toml = loadToml(paramPath);
  const benchParams = normalLoad(toml);
  logger.info(`analyzing parameter file finished. ${benchParams.length} jobs to run`);
}
