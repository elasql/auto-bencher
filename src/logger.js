const {createLogger, transports} = require('winston');

// create logger
const logger = createLogger({
    level: 'info',
    // TODO: we can add transports.File for exporting logs to file
    transports: [
      new transports.Console(),
    ]
  });

  module.exports = logger;