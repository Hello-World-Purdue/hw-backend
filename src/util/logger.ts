import winston, { format } from "winston";

const myformat: winston.Logform.Format = winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp(),
    winston.format.align(),
    winston.format.printf(info => ` \u001b[33m${info.timestamp}\u001b[0m ${info.level}: ${info.message}`)
);

const options: winston.LoggerOptions = {
    transports: [
        new winston.transports.Console({
            level: process.env.NODE_ENV === "production" ? "error" : "debug",
            format: myformat
        }),
        new winston.transports.File({ filename: "debug.log", level: "debug" })
    ]
};

const logger = winston.createLogger(options);

if (process.env.NODE_ENV !== "production") {
    logger.debug("Logging initialized at debug level");
}

export default logger;
