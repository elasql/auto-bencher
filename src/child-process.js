/* Reference:
 https://nodejs.org/api/child_process.html#child_process_child_process_exec_command_options_callback
*/
const util = require('util');
const childProcessExec = util.promisify(require('child_process').exec);

async function exec (cmd) {
/*
  PLEASE DO NOT TRY CATCH childProcessExec !!!!!

  a lot of functions depend on the return value and error of childProcessExec
  if you catch the error in this function
  it will cause disaster

  result will be {stdout:'...', stderr:''} if childProcessExec is resolved\
  else it will be {
    killed: false,
    code: 1,
    signal: null,
    cmd: 'your cmd',
    stdout: '',
    stderr: ''
  }
*/
  const result = await childProcessExec(cmd);
  return result;
};

module.exports = {
  exec: exec
};
