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
    nargs: 1,
    help: 'config.toml path',
    required: true,
    defaultValue: '',
    metavar: 'configPath',
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
    metavar: 'debug mode',
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
const paramArg = ['--parameter'];
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

const jarArg = ['-j', '--jars'];
const jarInfo = {
  type: 'string',
  nargs: 1,
  help: 'jars directory',
  required: true,
  defaultValue: '',
  metavar: 'jars_dir',
  dest: 'jarsDir'
};

const propArg = ['--properties'];
const propInfo = {
  type: 'string',
  nargs: 1,
  help: 'default-properties directory',
  required: true,
  defaultValue: '',
  metavar: 'prop_dir',
  dest: 'propDir'
};

// load
const load = subparsers.addParser(
  'load',
  {
    addHelp: true,
    required: true
  }
);

load.addArgument(
  paramArg,
  paramInfo
);

load.addArgument(
  dbArg,
  dbInfo
);

load.addArgument(
  jarArg,
  jarInfo
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
  paramArg,
  paramInfo
);

benchmark.addArgument(
  dbArg,
  dbInfo
);

benchmark.addArgument(
  jarArg,
  jarInfo
);

benchmark.addArgument(
  propArg,
  propInfo
);

benchmark.addArgument(
  ['-i', '--ignore'],
  {
    action: 'storeTrue',
    nargs: 0,
    help: 'ignore error',
    defaultValue: false,
    metavar: 'ignore',
    dest: 'ignore'
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
