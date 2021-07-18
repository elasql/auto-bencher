const Connection = require('../remote/connection');
const { Action } = require('../actions/remote-actions');

// TODO: should test this function !!!
// This generate a simple object { id, ip, port }
function generateConnectionList (configParam, benchParam, action, isStandAloneMode) {
  const {
    serverCount,
    serverClientRatio,
    maxServerPerMachine,
    maxClientPerMachine
  } = getParams(benchParam);

  const initPort = 30000;
  const connection = new Connection(initPort);
  // get sequencer IP, servers IP list, client IP list
  const { sequencer, servers, clients } = configParam;

  // TODO: handle tha case that we don't declare sequencer explicitly(current way use undefined...)
  // seqConns is an object.
  const seqConn = sequencer ? Connection.getConn(serverCount, sequencer, initPort) : undefined;

  const serverConns = connection.getConns(servers, isStandAloneMode ? serverCount : (serverCount - 1), maxServerPerMachine); // serverConns is an array.
  if (!isStandAloneMode) {
    seqConn.id -= 1;
  }

  // clientConss is an array.
  const clientCount = action === Action.loading ? 1 : Math.floor(serverCount * serverClientRatio);
  const clientConns = connection.getConns(clients, clientCount, maxClientPerMachine);

  const isStandAlone = false;

  return {
    seqConn,
    serverConns,
    clientConns,
    isStandAlone
  };
}

function getParams (benchParam) {
  const autoBencher = 'auto_bencher';
  return {
    serverCount: benchParam.getNumValue(autoBencher, 'server_count'),
    serverClientRatio: benchParam.getNumValue(autoBencher, 'server_client_ratio'),
    maxServerPerMachine: benchParam.getNumValue(autoBencher, 'max_server_per_machine'),
    maxClientPerMachine: benchParam.getNumValue(autoBencher, 'max_client_per_machine')
  };
}

module.exports = {
  generateConnectionList: generateConnectionList
};
