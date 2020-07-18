const fs = require('fs');
const path = require('path');
const CsvReadableStream = require('csv-reader');
const createCsvWriter = require('csv-writer').createArrayCsvWriter;

const logger = require('../logger');

const { run } = require('./runner');
const { Action } = require('../actions/remote-actions');
const { multiLoad } = require('../preparation/parameter-loader');

const {
  join,
  loadToml,
  getYearMonthDateStr,
  getHourMinSecStr
} = require('../utils');

const REPORT_DIR = 'reports';
const MAIN_REPORT = 'throughput.csv';

async function execute (configParam, args) {
  const dbName = args.dbName[0];
  const paramPath = args.paramPath[0];
  const ignoreError = args.ignore;

  logger.info('preparing for running benchmarks...');
  logger.info(`using parameter file '${paramPath}'`);
  const toml = loadToml(paramPath);
  const benchParams = multiLoad(toml);

  logger.info(`analyizing parameter file finished, ${benchParams.length} jobs to run`);

  // prepare for the final report
  const date = new Date();
  const mainReportDir = createReportDir(date);
  const mainReportPath = join(mainReportDir, MAIN_REPORT);
  const csvWriter = writeHeader(mainReportPath, benchParams[0]);

  for (const id in benchParams) {
    logger.info(`running job ${id}`);

    // create job's directory
    const jobDir = join(mainReportDir, `job-${id}`);
    createJobDir(jobDir);

    let tps;
    try {
      tps = await run(configParam, benchParams[id], args, dbName, Action.benchmarking, jobDir);
    } catch (err) {
      if (!ignoreError) {
        throw Error(err.message);
      }
      logger.info(`job ${id} failed - ignore`.red);
    }
    const totalTp = sumTp(tps);
    logger.info(`job ${id} finished successfully`.green);
    logger.info(`the total throughput of job ${id} is ${totalTp}`);

    logger.info(`writing the result to the report`);
    await aggregateResults(jobDir, id);
    await writeReport(csvWriter, id, benchParams[id], totalTp);
  }

  logger.info(`benchmarking finished`.green);
}

function createReportDir (date) {
  const ymd = getYearMonthDateStr(date);
  const hms = getHourMinSecStr(date);
  const reportDir = path.join(REPORT_DIR, ymd, hms);
  createDir(reportDir);
  return reportDir;
}

function createJobDir (jobDir) {
  createDir(jobDir);
}

function createDir (path) {
  fs.mkdirSync(path, { recursive: true });
}

function sumTp (tps) {
  let totalTp = 0;
  for (const clientId in tps) {
    totalTp += tps[clientId];
  }
  return totalTp;
}

function writeHeader (mainReportPath, benchParam) {
  return createCsvWriter({
    path: mainReportPath,
    header: ['job_id'].concat(benchParam.getProperties(), ['throughput'])
  });
}

async function writeReport (csvWriter, jobId, benchParam, throughput) {
  const records = [jobId].concat(benchParam.getPropertiesValues, [throughput]);
  await csvWriter.writeRecords(records);
}

async function aggregateResults (jobDir, jobId) {
  const timeline = {};

  const files = fs.readdirSync(jobDir);
  for (const file of files) {
    if (path.extname(file) === '.csv') {
      logger.debug(`reading ${file}`);
      await readCsv(file, timeline);
      logger.debug(`finished parsing ${file}`);
    }
  }

  const timelineWriter = createCsvWriter({
    path: path.join(jobDir, `job-${jobId}-timeline.csv`),
    header: ['time', 'throughput']
  });

  // object to 2D list
  // [
  //  [0, 102],
  //  [1, 98]...
  // ]
  const records = [];
  for (const time in timeline) {
    records.push([time, timeline[time]]);
  }

  await timelineWriter.writeRecords(records);
}

// TODO: test this function
async function readCsv (file, timeline) {
  return new Promise((resolve, reject) => {
    const inputStream = fs.createReadStream(file, 'utf8');
    inputStream
      .pipe(new CsvReadableStream({
        parseNumber: true,
        trim: true
      }))
      .on('data', row => {
        const t = row[0];
        const tp = row[1];
        if (!Object.prototype.hasOwnProperty.call(timeline, t)) {
          timeline[t] = 0;
        }
        timeline[t] += tp;
      })
      .on('end', () => {
        resolve('OK');
      })
      .on('error', reject);
  });
}

module.exports = {
  execute
};
