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
    metavar: 'config.toml path',
    dest: 'configPath'
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
  ['-p', '--parameter'],
  {
    type: 'string',
    nargs: 1,
    help: 'parameter file path',
    required: true,
    defaultValue: '',
    metavar: 'normal-load.toml path',
    dest: 'paramPath'
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
    metavar: 'database directory name',
    dest: 'dbName'
  }
);

module.exports = parser.parseArgs();
