const { ArgumentParser } = require('argparse');

const parser = new ArgumentParser({
  version: '0.0.1',
  addHelp: true,
  description: 'AutoBencher'
});

parser.addArgument(
  ['-c', '--config'],
  {
    type: 'string',
    nargs: 1,
    help: 'config.toml path',
    required: true,
    defaultValue: '',
    metavar: 'path',
    dest: 'configPath'
  }
);

parser.addArgument(
  ['-D', '--debug'],
  {
    action: 'storeTrue',
    nargs: 0,
    help: 'display debug messages',
    defaultValue: false,
    metavar: 'debug',
    dest: 'debug'
  }
);

const subparsers = parser.addSubparsers({
  title: 'mode',
  dest: 'mode'
});

// init
subparsers.addParser(
  'init',
  {
    addHelp: true,
    required: true
  }
);

// load
const load = subparsers.addParser(
  'load',
  {
    addHelp: true,
    required: true
  }
);

load.addArgument(
  ['-j', '--jars'],
  {
    type: 'string',
    nargs: 1,
    help: 'jars directory',
    required: true,
    defaultValue: '',
    metavar: 'dir',
    dest: 'jarsDir'
  }
);

load.addArgument(
  ['--parameter'],
  {
    type: 'string',
    nargs: 1,
    help: 'parameter file path',
    required: true,
    defaultValue: '',
    metavar: 'path',
    dest: 'paramPath'
  }
);

load.addArgument(
  ['--properties'],
  {
    type: 'string',
    nargs: 1,
    help: 'default-properties directory',
    required: true,
    defaultValue: '',
    metavar: 'dir',
    dest: 'propDir'
  }
);

load.addArgument(
  ['-d', '--db'],
  {
    type: 'string',
    nargs: 1,
    help: 'database directory name',
    required: true,
    defaultValue: '',
    metavar: 'name',
    dest: 'dbName'
  }
);

module.exports = parser.parseArgs();
