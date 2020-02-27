module.exports = {
  asyncScpTo: async function (is_dir, user_name, ip, local_path, remote_path) {
    const util = require('util')
    const exec = util.promisify(require('child_process').exec)
    try {
      cmd = 'scp '
      if (is_dir) { cmd += '-r ' }
      const { stdout, stderr } = await exec(cmd + local_path + ' ' + user_name + '@' + ip + ':' + remote_path)
      return stdout
    } catch (ex) {
      return false
    }
  },
  asyncSSh: async function (user_name, ip, remote_cmd) {
    const util = require('util')
    const exec = util.promisify(require('child_process').exec)
    try {
      cmd = 'ssh ' + user_name + '@' + ip + ' ' + remote_cmd
      // console.log(cmd);
      const { stdout, stderr } = await exec(cmd)
      // await console.log(stdout);
      // await console.log(stderr);
      return stdout
    } catch (ex) {
      // await console.log(ex);
      return false
    }
  },
  ssh: function (user_name, ip, remote_cmd) {
    const execSync = require('child_process').execSync
    try {
      execSync('ssh ' + user_name + '@' + ip + ' ' + remote_cmd, { stdio: 'pipe' })
      return true
    } catch (ex) {
      return false
    }
  },
  scp_to: function (is_dir, user_name, ip, local_path, remote_path) {
    const execSync = require('child_process').execSync
    try {
      cmd = 'scp '
      if (is_dir) { cmd += '-r ' }
      execSync(cmd + local_path + ' ' + user_name + '@' + ip + ':' + remote_path, { stdio: 'pipe' })
      return true
    } catch (ex) {
      return false
    }
  },
  cp: function (is_dir, source, dest) {
    const execSync = require('child_process').execSync
    try {
      cmd = 'cp '
      if (is_dir) { cmd += '-r ' }
      execSync(cmd + source + ' ' + dest, { stdio: 'pipe' })
      return true
    } catch (ex) {
      return false
    }
  }
}
