/*
  runner will coordinate sequencer, servers and clients
*/

const Cmd = require('../ssh/cmd');
const logger = require('../logger');
const Server = require('../remote/server');
const Client = require('../remote/client');

const { generateConnectionList } = require('../remote/connection-list');
const { prepareBenchEnv } = require('../preparation/prepare-bench-dir');
const { killBenchmarker, Action } = require('../actions/remote-actions');
const { reject } = require('lodash');

// TODO: should move this class to remote

// TODO: add basic checks for arguments
async function run (configParam, benchParam, args, dbName, action, reportDir) {
  // generate connection information (ip, port)
  const systemConn = generateConnectionList(configParam, benchParam, action);

  try {
    // prepare the benchmark directory
    const vmArgs = await prepareBenchEnv(configParam, benchParam, systemConn, args);

    logger.info('connecting to the machines...');

    logger.info('killing the existing benchmarker processes...');
    await killAll(configParam, systemConn);

    const tps = await start(configParam, dbName, action, reportDir, vmArgs, systemConn);
    return tps;
  } catch (err) {
    throw Error(`${err.message.red}`);
  }
}

async function killAll (configParam, systemConn) {
  const { seqConn, serverConns, clientConns } = systemConn;
  let nodeConns = [];

  if (seqConn) {
    nodeConns.push(seqConn);
  }
  // generate an array including servers, a sequencer and clients
  nodeConns = nodeConns.concat(serverConns, clientConns);

  // kill twice may cause ssh errors
  const alreadyKill = {};

  await Promise.all(
    nodeConns.map(nodeConn => {
      if (Object.prototype.hasOwnProperty.call(alreadyKill, nodeConn.ip)) {
        return;
      }
      // assign whatever you want, just consider alreadyKill as a set
      alreadyKill[nodeConn.ip] = true;
      return kill(configParam, nodeConn);
    })
  );
}

// kill benchmarker
async function kill (configParam, conn) {
  const cmd = new Cmd(configParam.systemUserName, conn.ip);
  await killBenchmarker(cmd);
}

async function start (configParam, dbName, action, reportDir, vmArgs, systemConn) {
  const { seqConn, serverConns, clientConns, isStandAlone } = systemConn;

  const servers = newServers(serverConns, configParam, dbName, vmArgs);
  const clients = newClients(clientConns, configParam, vmArgs);

  let allServers;

  if (isStandAlone) {
    const sequencer = newSequencer(seqConn, configParam, dbName, vmArgs);
    allServers = servers.concat(sequencer);
  } else {
    servers[servers.length - 1] = new Server(configParam, serverConns[serverConns.length - 1], dbName, vmArgs, true, false);
    allServers = servers;
  }

  try {
    // run servers and sequencer
    await Promise.all(allServers.slice(0, allServers.length - 1).map(server => server.run(action)));
  } catch (err) {
    throw Error(`error occurs at server initialization - ${err.message.red}`);
  }

  logger.info(`successfully initialize all servers`.green);

  try {
    // run servers and sequencer
    await Promise.all(allServers.slice(allServers.length - 1, allServers.length).map(server => server.run(action)));
  } catch (err) {
    throw Error(`error occurs at sequencer initialization - ${err.message.red}`);
  }

  logger.info(`successfully initialize the sequencer`.green);

  // let servers check error
  // don't use "await", it will block the following clients' actions

  Promise.all(allServers.map(server => server.checkError())).catch(err => {
    logger.error(err);
    return reject();
  });

  // throughput object
  // key is client id and value is throughtput
  const tps = {};
  try {
    // let client run and let server check error at the same time
    await Promise.all(clients.map(client => client.run(action, reportDir, tps)));
  } catch (err) {
    throw Error(`${err.message.red}`);
  }

  // stop checking error
  allServers.map(server => {
    server.stopCheckingError();
  });

  if (action === Action.loading) {
    logger.info('backing up the db on all servers');
    try {
      // backupDb
      await Promise.all(allServers.map(server => server.backupDb()));
    } catch (err) {
      throw Error(`error occurs at backing up db - ${err.message.red}`);
    }
  }

  // return throughput object
  return tps;
}

function newSequencer (seqConn, configParam, dbName, vmArgs) {
  return new Server(configParam, seqConn, dbName, vmArgs, true, true);
}

function newServers (serverConns, configParam, dbName, vmArgs) {
  return serverConns.map(serverConn => {
    return new Server(configParam, serverConn, dbName, vmArgs, false, false);
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
