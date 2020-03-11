const { createLogger, transports, format } = require('winston');
const { combine, label, printf } = format;

const winston = require('winston');
const args = require('./args');
winston.level = args.debug ? 'debug' : 'info';

const customizedFormat = printf(({ level, message, label }) => {
  return `[${label}] ${level}: ${message}`;
});

// create logger
const logger = createLogger({
  level: 'info',
  format: combine(
    label({
      label: 'Auto bencher'
    }),
    customizedFormat
  ),
  // TODO: we can add transports.File for exporting logs to file
  transports: [
    new transports.Console()
  ]
});

module.exports = logger;
