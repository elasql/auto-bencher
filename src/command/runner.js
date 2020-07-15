const logger = require('../logger');
const Server = require('../remote/server');
const Client = require('../remote/client');
const Cmd = require('../ssh/ssh-generator');
const { generateConnectionList } = require('../remote/connection-list');

const { prepareBenchDir } = require('../preparation/prepare-bench-dir');
const { exec } = require('../ssh/ssh-executor');

async function run (configParam, benchParam, args, dbName, action, reportDir = '') {
  // generate connection information (ip, port)
  const systemConn = generateConnectionList(configParam, benchParam, action);

  // prepare the benchmark directory
  const vmArgs = await prepareBenchDir(configParam, benchParam, systemConn, args);

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
  nodeConns = nodeConns.concat(serverConns, clientConns);

  await Promise.all(
    nodeConns.map(nodeConn => killBenchmarker(configParam, nodeConn))
  );
}

async function killBenchmarker (configParam, conn) {
  const kill = Cmd.getKillBenchmarker();
  const ssh = new Cmd(configParam.systemUserName, conn.ip).getSsh(kill);
  try {
    await exec(ssh);
  } catch (err) {
    if (err.code === 1) {
      // don't do anything because there may be no running process
      return;
    }
    logger.info(err.message);
  }
}

async function start (configParam, dbName, action, reportDir, vmArgs, systemConn) {
  const { seqConn, serverConns, clientConns } = systemConn;

  const sequencer = newSequencer(seqConn, configParam, dbName, vmArgs);
  const servers = newServers(serverConns, configParam, dbName, vmArgs);
  const clients = newClients(clientConns, configParam, vmArgs);

  const allServers = servers.concat(sequencer);

  try {
    // init servers and sequencer
    await Promise.all(allServers.map(server => server.init()));
  } catch (err) {
    throw Error(`error occurs at server initialization - ${err.message.red}`);
  }

  logger.info(`successfully initialize all servers`);

  try {
    // let client run and let server check error at the same time
    await Promise.all(clients.concat(allServers).map(obj => {
      if (Object.prototype.hasOwnProperty.call(obj, 'stopSignal')) {
        return obj.checkError();
      } else {
        return obj.run(action, reportDir);
      }
    }));
  } catch (err) {
    throw Error(`${err.message.red}`);
  }

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
