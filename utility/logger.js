const winston = require("winston");
const { printf, timestamp, combine } = winston.format;

function createLogger() {
  const myFormat = printf(({ level, message, timestamp }) => {
    return `${timestamp} [${level}] ${message}`;
  });
  
  return winston.createLogger({
    level: "info",
    transports: [
      new winston.transports.Console(),
      new winston.transports.File({ filename: "logs/info.log", level: "info" }),
      new winston.transports.File({
        filename: "logs/error.log",
        level: "error",
      }),
    ],
    format: combine(timestamp(), myFormat),
  });
}

module.exports = createLogger;