const { NormalLoad } = require('../benchmark-parameter');
const { Connection, Action } = require('../connection/connection');

function run (configParam, benchParam, dbName, action, reportDir = '') {
  const systemConn = generateConnectionList(configParam, benchParam, action);
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

  const seqInfo = Connection.getInfo(serverCount, sequencer, initPort);
  const serverConns = connection.getConnList(servers, serverCount, maxServerPerMachine);

  const clientCount = action === Action.loading ? 1 : serverCount * serverClientRatio;
  const clientConns = connection.getConnList(clients, clientCount, maxClientPerMachine);

  return {
    seqInfo,
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

module.exports = {
  run: run
};
