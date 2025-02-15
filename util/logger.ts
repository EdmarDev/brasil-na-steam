import winston from "winston"
const {combine, timestamp, json, errors} = winston.format

export const logger = winston.createLogger({
  level: "info",
  format: combine(timestamp(), errors({stack: true}), json()),
  transports: [new winston.transports.File({filename: "logs/default.log"})],
  exceptionHandlers: [
    new winston.transports.File({filename: "logs/exceptions.log"}),
  ],
  rejectionHandlers: [
    new winston.transports.File({filename: "logs/rejections.log"}),
  ],
})
