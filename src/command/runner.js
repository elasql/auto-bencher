const logger = require('../logger');
const { NormalLoad } = require('../benchmark-parameter');
const { Connection, Action } = require('../connection/connection');
const { prepareBenchDir } = require('../preparation');
const ShellCmd = require('../shell-cmd');
const { exec } = require('../child-process');

async function run (configParam, benchParam, dbName, action, reportDir = '') {
  // generate connection information (ip, port)
  const systemConn = generateConnectionList(configParam, benchParam, action);

  // prepare the benchmark directory
  const vmArgs = await prepareBenchDir(configParam, benchParam, systemConn);

  logger.info('connecting to the machines...');
  logger.info('killing the existing benchmarker processes...');

  await killAll(configParam, systemConn);
}

// TODO: should test this function !!!
function generateConnectionList (configParam, benchParam, action) {
  const {
    serverCount,
    serverClientRatio,
    maxServerPerMachine,
    maxClientPerMachine
  } = getParams(benchParam);

  const initPort = 30000;
  const connection = new Connection(initPort);
  const { sequencer, servers, clients } = configParam;

  const seqConn = Connection.getInfo(serverCount, sequencer, initPort);
  const serverConns = connection.getConnList(servers, serverCount, maxServerPerMachine);

  const clientCount = action === Action.loading ? 1 : serverCount * serverClientRatio;
  const clientConns = connection.getConnList(clients, clientCount, maxClientPerMachine);

  return {
    seqConn,
    serverConns,
    clientConns
  };
}

function getParams (benchParam) {
  const autoBencher = 'auto_bencher';
  return {
    serverCount: NormalLoad.getNumValue(benchParam, autoBencher, 'server_count'),
    serverClientRatio: NormalLoad.getNumValue(benchParam, autoBencher, 'server_client_ratio'),
    maxServerPerMachine: NormalLoad.getNumValue(benchParam, autoBencher, 'max_server_per_machine'),
    maxClientPerMachine: NormalLoad.getNumValue(benchParam, autoBencher, 'max_client_per_machine')
  };
}

// TODO: kill them in concurrency
async function killAll (configParam, systemConn) {
  const { seqConn, serverConns, clientConns } = systemConn;

  if (seqConn) {
    await killBenchmarker(configParam, seqConn);
  }

  await Promise.all(
    serverConns.map(serverConn => {
      killBenchmarker(configParam, serverConn);
    })
  );

  await Promise.all(
    serverConns.map(serverConn => {
      killBenchmarker(configParam, serverConn);
    })
  );
}

async function killBenchmarker (configParam, connObj) {
  const kill = ShellCmd.getKillBenchmarker();
  const ssh = new ShellCmd(configParam.systemUserName, connObj.ip).getSsh(kill);

  await exec(ssh);
}

module.exports = {
  run: run
};
