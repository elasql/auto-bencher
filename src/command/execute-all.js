const Cmd = require('../ssh/cmd');
const logger = require('../logger');

const { runSSH } = require('../actions/remote-actions');

async function execute (configParam, args) {
  const {
    involvedMachines,
    systemUserName
  } = configParam;

  const command = args.command[0].trim();

  for (const id in involvedMachines) {
    const ip = involvedMachines[id];
    const cmd = new Cmd(systemUserName, ip);

    logger.info(`run ssh on - ${ip}`);

    try {
      await runSSH(cmd, command, {
        prefix: 'node',
        id: id,
        ip: ip
      });
    } catch (err) {
      logger.info(err.message);
    }
  }
};

module.exports = {
  execute
};
