const client = require('../connection/client');
const con_com = require('../connection/con-com');
module.exports = {
  async_client_exec: async_client_exec
};
function async_client_exec (config, conn_info, vm_args, action) {
  this.client = new client.Client(config, conn_info, vm_args);
  this.action = action;
  this.stop = false;

  this.prepare = async function () {
    this.client.clean_previous_results();
    this.client.send_bench_dir();
  };
  this.server_start = async function () {};
  this.seq_start = async function () {};
  this.server_check_error = async function () {};
  this.client_start = async function () {
    await console.log('Starting clients... ip-' + this.client.connection_info.ip);
    await this.client.start(this.action);
  };
  this.client_finish = async function () {
    if (this.client.id == 0) { await console.log('All clients are running. Waiting for finishing...'); }

    while (!await this.client.check_for_finished(action)) {
      await new Promise(resolve => { setTimeout(resolve, 1000); });
    }
  };
}
