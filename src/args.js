const process = require('process');
const { ArgumentParser } = require('argparse');

const parser = new ArgumentParser({
  version: '0.0.1',
  addHelp: true,
  description: 'AutoBencher'
});

/*
  main arguments
*/
parser.addArgument(
  ['-c', '--config'],
  {
    type: 'string',
    nargs: '?',
    help: 'config.toml path',
    required: false,
    defaultValue: './config.toml',
    metavar: 'configPath',
    dest: 'configPath'
  }
);

parser.addArgument(
  ['-D', '--debug'],
  {
    action: 'storeTrue',
    help: 'display debug messages',
    defaultValue: false,
    dest: 'debug'
  }
);

/*
  sub-arguments
*/
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

// these objects will be used by multiple parsers
const paramArg = ['-p', '--parameter'];
const paramInfo = {
  type: 'string',
  nargs: 1,
  help: 'parameter file',
  required: true,
  defaultValue: '',
  metavar: 'param_path',
  dest: 'paramPath'
};

const dbArg = ['-d', '--db'];
const dbInfo = {
  type: 'string',
  nargs: 1,
  help: 'database name',
  required: true,
  defaultValue: '',
  metavar: 'db_name',
  dest: 'dbName'
};

const propArg = ['--properties'];
const propInfo = {
  type: 'string',
  nargs: '?',
  help: 'default-properties directory',
  defaultValue: './default-properties',
  metavar: 'prop_dir',
  dest: 'propDir'
};

const ignoreArg = ['-i', '--ignore'];

// load
const load = subparsers.addParser(
  'load',
  {
    addHelp: true,
    required: true
  }
);

load.addArgument(
  dbArg,
  dbInfo
);

load.addArgument(
  paramArg,
  paramInfo
);

load.addArgument(
  propArg,
  propInfo
);

// benchmark
const benchmark = subparsers.addParser(
  'benchmark',
  {
    addHelp: true,
    required: true
  }
);

benchmark.addArgument(
  dbArg,
  dbInfo
);

benchmark.addArgument(
  paramArg,
  paramInfo
);

benchmark.addArgument(
  propArg,
  propInfo
);

benchmark.addArgument(
  ignoreArg,
  {
    action: 'storeTrue',
    help: 'ignore error',
    defaultValue: false,
    dest: 'ignore'
  }
);

// pull
const pull = subparsers.addParser(
  'pull',
  {
    addHelp: true,
    required: true
  }
);

pull.addArgument(
  ['-p', '--pattern'],
  {
    type: 'string',
    nargs: 1,
    help: 'pattern e.g. *.csv',
    required: true,
    defaultValue: '',
    metavar: 'pattern',
    dest: 'pattern'
  }
);

pull.addArgument(
  ['-s', '--seperate'],
  {
    action: 'storeTrue',
    help: 'save files respectively',
    defaultValue: false,
    dest: 'seperate'
  }
);

pull.addArgument(
  ignoreArg,
  {
    action: 'storeTrue',
    help: 'ignore error',
    defaultValue: false,
    dest: 'ignore'
  }
);

// exec
const execute = subparsers.addParser(
  'exec',
  {
    addHelp: true,
    required: true
  }
);

execute.addArgument(
  ['--command'],
  {
    type: 'string',
    nargs: 1,
    help: 'ssh cmd e.g. pkill -f benchmarker',
    required: true,
    defaultValue: '',
    metavar: 'command',
    dest: 'command'
  }
);

// make test easier
let args;
if (!process.argv[1].includes('mocha')) {
  args = parser.parseArgs();
}

module.exports = {
  parser: parser,
  args: args
};
