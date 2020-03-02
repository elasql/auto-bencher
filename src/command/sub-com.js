const con_com = require('../connection/connection');
const preparation = require('../preparation');
const command = require('../command');
const exe_com = require('../execute/exe-com');
module.exports = {
  run: function (config, parameter, db_name, action, report_dir) {
    // console.log(config, parameter, db_name, action, report_dir);
    [sequencer, server_list, client_list] = generate_connection_list(config, parameter, action);
    vm_args = preparation.prepare_bench_dir(config, parameter, sequencer, server_list, client_list);
    console.log('Connecting to machines...');
    console.log('Killing existing benchmarker processes...');
    [sequencer, server_list, client_list].forEach(machines => {
      if (!machines.length) {
        kill_benchmarker(config, machines);
      } else {
        machines.forEach(each => {
          kill_benchmarker(config, each);
        });
      }
    });
    exe_com.execute(config, db_name, action, report_dir, vm_args, sequencer, server_list, client_list);
  }
};
function generate_connection_list (config, parameter, action) {
  server_count = parameter.get_autobencher_param('server_count');
  server_client_ratio = parameter.get_autobencher_param('server_client_ratio');
  max_server_per_machine = parameter.get_autobencher_param('max_server_per_machine');
  max_client_per_machine = parameter.get_autobencher_param('max_client_per_machine');
  client_count = Math.floor(server_count * server_client_ratio);
  // console.log(client_count);
  // sequencer = config.machines.sequencer.map()
  sequencer = null;
  if ('sequencer' in config.machines) { sequencer = new con_com.ConnectionInfo(server_count, config.machines.sequencer, 35000, 'sequencer'); }

  // for(i in sequencer)
  //     console.log(sequencer[i].to_string());
  server_list = con_com.generate_connection_list(config.machines.servers, server_count, max_server_per_machine, 'server');
  if (con_com.Action.loading == action) {
    client_list = con_com.generate_connection_list(config.machines.clients, 1, max_client_per_machine, 'client');
  } else {
    client_list = con_com.generate_connection_list(config.machines.clients, client_count, max_client_per_machine, 'client');
  }
  return [sequencer, server_list, client_list];
}
function kill_benchmarker (config, machine) {
  bool = command.ssh(config.system.user_name, machine.ip, 'pkill -f benchmarker');
  if (!bool) { console.log('No existing process is found on ' + machine.ip); }
}
