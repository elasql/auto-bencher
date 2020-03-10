/* Reference:
 https://nodejs.org/api/child_process.html#child_process_child_process_exec_command_options_callback
*/
const util = require('util');
const childProcessExec = util.promisify(require('child_process').exec);

async function exec (cmd) {
/*
  if childProcessExec is resolved
  return {
    stdout:'...',
    stderr:''
  }

  else return {
    killed: false,
    code: 1,
    signal: null,
    cmd: 'your cmd',
    stdout: '',
    stderr: '...'
  }
*/

  /*
  PLEASE DO NOT TRY CATCH childProcessExec !!!!!

  a lot of functions depend on the returned values and errors of childProcessExec
  if you catch the errors in this function
  it will cause a disaster
  */
  try {
    return await childProcessExec(cmd);
  } catch (err) {
    return err;
  }
};

module.exports = {
  exec: exec
};
