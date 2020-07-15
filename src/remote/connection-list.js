const Parameter = require('../preparation/parameter');
const Connection = require('../remote/connection');
const { Action } = require('../actions/remote-actions');

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
  const param = Parameter(benchParam);
  return {
    serverCount: param.getNumValue(autoBencher, 'server_count'),
    serverClientRatio: param.getNumValue(autoBencher, 'server_client_ratio'),
    maxServerPerMachine: param.getNumValue(autoBencher, 'max_server_per_machine'),
    maxClientPerMachine: param.getNumValue(autoBencher, 'max_client_per_machine')
  };
}

module.exports = {
  generateConnectionList: generateConnectionList
};
