const bunyan = require('bunyan');
const bunyanFormat = require('bunyan-format');
const loggingFormat = process.env.LOGGING_FORMAT || 'long';
const format = bunyanFormat({ outputMode: loggingFormat });
const logger = bunyan.createLogger({ name: "SSE", stream: format, src: true });
module.exports = logger;
