const server = require('../connection/server');
const con_com = require('../connection/con-com');
module.exports = {
  async_server_exec: async_server_exec
};
function async_server_exec (config, conn_info, db_name, vm_args, is_sequencer, action) {
  this.server = new server.Server(config, conn_info, db_name, vm_args, is_sequencer);
  this.action = action;
  this.is_sequencer = is_sequencer;
  this.stop = false;

  this.prepare = async function () {
    // if server.id() == 0 {
    await console.log('Preparing servers... ip-' + this.server.connection_info.ip);
    // }

    await this.server.send_bench_dir();

    if (this.action == con_com.Action.loading) {
      await this.server.delete_db_dir();
      await this.server.delete_backup_db_dir();
    } else if (this.action == con_com.Action.Benchmarking) {
      await this.server.reset_db_dir();
    }
  };
  this.server_start = async function () {
    if (!is_sequencer) {
      await this.server.start();
      while (!await this.server.check_for_ready()) {
        await new Promise(resolve => { setTimeout(resolve, 1000); });
      }
      await console.log('Server ' + this.server.id + ' is ready.');
    }
  };
  this.seq_start = async function () {
    if (is_sequencer) {
      await this.server.start();
      while (!await this.server.check_for_ready()) {
        await new Promise(resolve => { setTimeout(resolve, 1000); });
      }
      await console.log('The sequencer is ready.');
      await console.log('All servers are ready.');
    }
  };
  this.server_check_error = async function () {
    await console.log('start~~ ip-' + this.server.connection_info.ip);
    while (!await this.stop) {
      await this.server.check_for_error();
      await new Promise(resolve => { setTimeout(resolve, 1000); });
    }
    await console.log('finish~~ ip-' + this.server.connection_info.ip);
  };
  this.client_start = async function () {};
  this.client_finish = async function () {};
}
