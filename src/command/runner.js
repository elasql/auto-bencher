/*
  runner will coordinate sequencer, servers and clients
*/

const logger = require('../logger');
const Server = require('../remote/server');
const Client = require('../remote/client');
const Cmd = require('../ssh/cmd');
const { generateConnectionList } = require('../remote/connection-list');

const { prepareBenchEnv } = require('../preparation/prepare-bench-dir');

const { killBenchmarker } = require('../actions/remote-actions');

async function run (configParam, benchParam, args, dbName, action, reportDir = '') {
  // generate connection information (ip, port)
  const systemConn = generateConnectionList(configParam, benchParam, action);

  // prepare the benchmark directory
  const vmArgs = await prepareBenchEnv(configParam, benchParam, systemConn, args);

  logger.info('connecting to the machines...');

  logger.info('killing the existing benchmarker processes...');
  await killAll(configParam, systemConn);

  await start(configParam, dbName, action, reportDir, vmArgs, systemConn);
}

async function killAll (configParam, systemConn) {
  const { seqConn, serverConns, clientConns } = systemConn;
  let nodeConns = [];

  if (seqConn) {
    nodeConns.push(seqConn);
  }
  // generate an array including servers, a sequencer and clients
  nodeConns = nodeConns.concat(serverConns, clientConns);

  await Promise.all(
    nodeConns.map(nodeConn => kill(configParam, nodeConn))
  );
}

// kill benchmarker
async function kill (configParam, conn) {
  const cmd = new Cmd(configParam.systemUserName, conn.ip);
  await killBenchmarker(cmd);
}

async function start (configParam, dbName, action, reportDir, vmArgs, systemConn) {
  const { seqConn, serverConns, clientConns } = systemConn;

  const sequencer = newSequencer(seqConn, configParam, dbName, vmArgs);
  const servers = newServers(serverConns, configParam, dbName, vmArgs);
  const clients = newClients(clientConns, configParam, vmArgs);

  const allServers = servers.concat(sequencer);

  // debug code
  let serverRdy = false;

  try {
    // init servers and sequencer
    await Promise.all(allServers.map(server => server.init()));
    serverRdy = true;
  } catch (err) {
    throw Error(`error occurs at server initialization - ${err.message.red}`);
  }

  if (!serverRdy) {
    throw Error('debug code : servers are not ready');
  }

  logger.info(`successfully initialize all servers and sequencer`.green);

  try {
    // let client run and let server check error at the same time
    await Promise.all(clients.concat(allServers).map(obj => {
      // I just use stopSignal as a server indicator.
      if (Object.prototype.hasOwnProperty.call(obj, 'stopSignal')) {
        return obj.checkError();
      } else {
        return obj.run(action, reportDir);
      }
    }));
  } catch (err) {
    throw Error(`${err.message.red}`);
  }

  logger.info(`successfully initialize all servers and sequencer`.green);

  allServers.map(server => {
    server.stopSignal = true;
  });
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
