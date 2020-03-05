const { NormalLoad } = require('../benchmark-parameter');
const { Connection } = require('../connection/connection');

function run (configParam, param, dbName, action, reportDir = '') {
  

}

function generateConnectionList (configParam, param, action) {
  const {
    serverCount,
    serverClientRatio,
    maxServerPerMachine,
    maxClientPerMachine
  } = getParam(param);

  const { sequencer } = configParam;
  const seqInfo = Connection.getInfo(serverCount, sequencer, 30000);
  
}

function getParam(param) {
  const autoBencher = 'auto_bencher';
  return {
    serverCount: NormalLoad.getNumValue(param, autoBencher, 'server_count');
    serverClientRatio: NormalLoad.getNumValue(param, autoBencher, 'server_client_ratio');
    maxServerPerMachine: NormalLoad.getNumValue(param, autoBencher, 'max_server_per_machine');
    maxClientPerMachine: NormalLoad.getNumValue(param, autoBencher, 'max_client_per_machine');
  }
}

module.exports = {
  run: run
};
