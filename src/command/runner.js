const logger = require('../logger');
const { getNumValue } = require('../benchmark-parameter');
const { Connection, Action } = require('../connection/connection');
const Server = require('../connection/server');
const Client = require('../connection/client');
const { prepareBenchDir } = require('../preparation');
const ShellCmd = require('../shell-cmd');
const { exec } = require('../child-process');

async function run (configParam, benchParam, preparationDir, dbName, action, reportDir = '') {
  // generate connection information (ip, port)
  const systemConn = generateConnectionList(configParam, benchParam, action);

  // prepare the benchmark directory
  const vmArgs = await prepareBenchDir(configParam, benchParam, systemConn, preparationDir);

  logger.info('connecting to the machines...');
  logger.info('killing the existing benchmarker processes...');

  await killAll(configParam, systemConn);

  await start(configParam, dbName, action, reportDir, vmArgs, systemConn);
}

// TODO: should test this function !!!
// This generate a simple object { id, ip, port }
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

  const seqConn = Connection.getConn(serverCount, sequencer, initPort);
  const serverConns = connection.getConns(servers, serverCount, maxServerPerMachine);

  const clientCount = action === Action.loading ? 1 : serverCount * serverClientRatio;
  const clientConns = connection.getConns(clients, clientCount, maxClientPerMachine);

  return {
    seqConn,
    serverConns,
    clientConns
  };
}

function getParams (benchParam) {
  const autoBencher = 'auto_bencher';
  return {
    serverCount: getNumValue(benchParam, autoBencher, 'server_count'),
    serverClientRatio: getNumValue(benchParam, autoBencher, 'server_client_ratio'),
    maxServerPerMachine: getNumValue(benchParam, autoBencher, 'max_server_per_machine'),
    maxClientPerMachine: getNumValue(benchParam, autoBencher, 'max_client_per_machine')
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
    clientConns.map(clientConn => {
      killBenchmarker(configParam, clientConn);
    })
  );
}

async function killBenchmarker (configParam, conn) {
  const kill = ShellCmd.getKillBenchmarker();
  const ssh = new ShellCmd(configParam.systemUserName, conn.ip).getSsh(kill);

  await exec(ssh);
}

async function start (configParam, dbName, action, reportDir, vmArgs, systemConn) {
  const { seqConn, serverConns, clientConns } = systemConn;

  const sequencer = newSequencer(seqConn, configParam, dbName, vmArgs);
  const servers = newServers(serverConns, configParam, dbName, vmArgs);
  const clients = newClients(clientConns, configParam, vmArgs);

  const allServers = servers.concat(sequencer);

  // init servers and sequencer
  await Promise.all(allServers.map(server => {
    server.init();
  }));

  await Promise.all(clients.map(client => {
    client.run();
  }));

  await Promise.all(allServers.map(server => {
    server.stopSignal = true;
  }));
}

function newSequencer (seqConn, configParam, dbName, vmArgs) {
  return new Server(configParam, seqConn, dbName, vmArgs, true);
}

function newServers (serverConns, configParam, dbName, vmArgs) {
  return serverConns.map(serverConn => {
    return new Server(configParam, serverConn, dbName, vmArgs, false);
  });
}

function newClients (clientConns, configParam, vmArgs) {
  return clientConns.map(clientConn => {
    return new Client(configParam, clientConn, vmArgs);
  });
}

module.exports = {
  run: run
};
