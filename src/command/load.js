const logger = require('../logger');
const { loadToml } = require('../utils');
const { NormalLoad } = require('../benchmark-parameter');

const { run } = require('./runner');

function execute (configParams, argv) {
  const dbName = argv[3];
  const paramPath = argv[4];

  logger.info('preparing for loading testbed into ' + dbName.green);
  logger.info(`using parameter file '${paramPath}'`);

  const toml = loadToml(paramPath);
  const normalLoad = new NormalLoad();
  const benchParams = normalLoad.load(toml);

  run;
}

module.exports = {
  execute: function (config, argv) {
    db_name = argv[3];
    param_file = argv[4];
    console.log('Preparing for loading testbed into ' + db_name);
    console.log('Using parameter file ' + param_file);

    // Prepare the parameter file
    param_list = new parameter.ParameterList(param_file);
    param_list = param_list.toVec();

    if (param_list.length > 1) {
      throw new Error('The parameter file contains more than one combination');
    }

    sub_com.run(config, param_list[0], db_name, con_com.Action.loading, null);

    console.log('Loading testbed finished.');
  }
};
