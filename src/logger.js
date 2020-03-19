const { createLogger, transports, format } = require('winston');
const { combine, label, printf } = format;
const { args } = require('./args');

const customizedFormat = printf(({ level, message, label }) => {
  return `[${label}] ${level}: ${message}`;
});

let level;
if (!args) {
  level = 'debug';
} else {
  level = args.debug ? 'debug' : 'INFO';
}

const logger = createLogger({
  level: level,
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
