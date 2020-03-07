const fs = require('fs');
const logger = require('./logger');
const bp = require('./benchmark-parameter');
const ShellCmd = require('./shell-cmd');
const { exec } = require('./child-process');
const { PropertiesFileMap } = require('./properties');

const BENCH_DIR = 'benchmarker';
const prop_dir = 'props';
const propertiesDir = 'properties';

async function prepareBenchDir (configParam, benchParam, systemConn) {
  logger.info('preparing the benchmarker directory...');

  // ensure the existance of the benchmarker directory
  if (!fs.existsSync(BENCH_DIR)) {
    fs.mkdirSync(BENCH_DIR);
  }

  // copy the jar files to the benchmark directory
  await copyJars(benchParam);

  // Read the default Properties
  const map = new PropertiesFileMap(propertiesDir);
}

async function copyJars (benchParam) {
  await Promise.all(getJars(benchParam).map(jarPath => {
    lsAndCopy(jarPath);
  })
  );
}

async function lsAndCopy (jarPath) {
  const ls = ShellCmd.getLs(jarPath);
  await exec(ls);

  const cp = ShellCmd.getCp(false, jarPath, BENCH_DIR);
  await exec(cp);
}

function getJars (benchParam) {
  const jarDir = bp.getStrValue(benchParam, 'auto_bencher', 'jar_dir');
  const fileNames = ['server.jar', 'client.jar'];

  return fileNames.map(fileName => `jars/${jarDir}/${fileName}`);
}

/*
const BENCH_DIR = 'benchmarker';
const PROP_DIR = 'props';
const fs = require('fs');
const command = require('./command');
const properties = require('./properties');
module.exports = {
  prepare_bench_dir: function (config, parameter, sequencer, server_list, client_list) {
    console.log('Preparing the benchmarker directory...');
    if (!fs.existsSync(BENCH_DIR)) { fs.mkdirSync(BENCH_DIR); }
    dirname = parameter.get_autobencher_param('jar_dir');
    copy_jars(dirname);
    map = new properties.PropertiesFileMap();
    map.from_dir('./properties');
    parameter.override_properties(map);
    set_paths(config, map);
    set_connection_properties(map, sequencer, server_list, client_list);
    set_elasql_properties(map, server_list.length);

    prop_dir_path = BENCH_DIR + '/' + PROP_DIR;
    map.output_to_dir(prop_dir_path);

    remote_prop_dir_path = config.system.remote_work_dir + '/' + prop_dir_path;
    return map.get_vm_args(remote_prop_dir_path);
  }
};
function copy_jars (dir_name) {
  dir_path = 'jars/' + dir_name;
  filenames = ['server.jar', 'client.jar'];
  filenames.forEach(filename => {
    jar_path = dir_path + '/' + filename;
    if (!fs.existsSync(jar_path)) { throw new Error('cannot find the jar at: ' + jar_path); }
    command.cp(false, jar_path, BENCH_DIR);
  });
}
function set_paths (config, map) {
  map.set(
    'vanilladb',
    'org.vanilladb.core.storage.file.FileMgr.DB_FILES_DIR',
    config.system.remote_work_dir + '/databases'
  );
  map.set(
    'vanillabench',
    'org.vanilladb.bench.StatisticMgr.OUTPUT_DIR',
    config.system.remote_work_dir + '/results'
  );
}
function set_connection_properties (map, sequencer, server_list, client_list) {
  server_view = '';

  server_list.forEach(server => {
    if (server.id > 0) { server_view += (',\\ '); }
    server_view += (server.to_string());
  });
  if (sequencer) { server_view += ',\\ ' + sequencer.to_string(); }

  map.set(
    'vanilladbcomm',
    'org.vanilladb.comm.server.ServerAppl.SERVER_VIEW',
    server_view
  );

  // Set client view
  client_view = '';
  client_list.forEach(client => {
    if (client.id > 0) { client_view += (',\\ '); }
    client_view += client.to_string();
  });
  map.set(
    'vanilladbcomm',
    'org.vanilladb.comm.client.ClientAppl.CLIENT_VIEW',
    client_view
  );
  // Set stand alone sequencer
  map.set(
    'vanilladbcomm',
    'org.vanilladb.comm.server.ServerAppl.STAND_ALONE_SEQUENCER',
    (sequencer ? 'true' : 'false')
  );
}
function set_elasql_properties (map, server_count) {
  map.set(
    'elasql',
    'org.elasql.storage.metadata.PartitionMetaMgr.NUM_PARTITIONS',
    server_count
  );
}
*/
