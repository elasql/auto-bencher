
const server = require('./server');
const client = require('./client');
module.exports = {
  execute: async function (config, db_name, action, report_dir, vm_args, sequencer, server_list, client_list) {
    seq_vm_args = vm_args + ' ' + config.jdk.vmargs.sequencer;
    server_vm_args = vm_args + ' ' + config.jdk.vmargs.servers;
    client_vm_args = vm_args + ' ' + config.jdk.vmargs.clients;
    machines = await [].concat.apply([], [sequencer, server_list, client_list]);
    machines_func = await machines.map(conn_info => {
      if (conn_info.prop == 'sequencer') { return new server.async_server_exec(config, conn_info, db_name, seq_vm_args, true, action); } else if (conn_info.prop == 'server') { return new server.async_server_exec(config, conn_info, db_name, server_vm_args, false, action); } else if (conn_info.prop == 'client') { return new client.async_client_exec(config, conn_info, client_vm_args, action); }
    });
    await Promise.all(machines_func.map(machine => { return machine.prepare(); }));
    await Promise.all(machines_func.map(machine => { return machine.server_start(); }));
    await Promise.all(machines_func.map(machine => { return machine.seq_start(); }));

    await machines_func.map(machine => { return machine.server_check_error(); });

    await Promise.all(machines_func.map(machine => { return machine.client_start(); }));
    await Promise.all(machines_func.map(machine => { return machine.client_finish(); }));

    for (i in machines) {
      fun = machines_func[i];
      fun.stop = true;
    }
  }
};
