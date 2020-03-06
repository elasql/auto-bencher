const { NormalLoad } = require('../benchmark-parameter');
const { Connection, Action } = require('../connection/connection');

function run (configParam, param, dbName, action, reportDir = '') {
  const { seqInfo, serverConns, clientConns } = generateConnectionList(configParam, param, action);
}

// TODO: should test this function !!!
function generateConnectionList (configParam, benchParam, action) {
  const {
    serverCount,
    serverClientRatio,
    maxServerPerMachine,
    maxClientPerMachine
  } = getParam(benchParam);

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

function getParam (param) {
  const autoBencher = 'auto_bencher';
  return {
    serverCount: NormalLoad.getNumValue(param, autoBencher, 'server_count'),
    serverClientRatio: NormalLoad.getNumValue(param, autoBencher, 'server_client_ratio'),
    maxServerPerMachine: NormalLoad.getNumValue(param, autoBencher, 'max_server_per_machine'),
    maxClientPerMachine: NormalLoad.getNumValue(param, autoBencher, 'max_client_per_machine')
  };
}

module.exports = {
  run: run
};
