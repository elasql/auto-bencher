/* Reference:
 https://nodejs.org/api/child_process.html#child_process_child_process_exec_command_options_callback
*/
const util = require('util');
const childProcessExec = util.promisify(require('child_process').exec);

async function exec (cmd) {
  await childProcessExec(cmd);
};

module.exports = {
  exec: exec
};
