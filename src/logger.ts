import { createLogger, format, transports } from 'winston';

export function getLogger(label: string) {
  return createLogger({
    transports: [
      new transports.Console({
        level: process.env.LOG_LEVEL || 'debug',
        format: format.combine(
          format.errors({ stack: true }),
          format.label({ label }),
          format.timestamp({
            format: 'YYYY-MM-DD HH:mm:ss',
          }),
          format.colorize({
            level: true,
          }),
          format.splat(),
          format.metadata({
            fillExcept: ['label', 'message', 'level', 'timestamp'],
          }),
          // format.prettyPrint(),
          format.printf(
            (info) =>
              `${info.timestamp} ${info.level} [${info.label}] -- ${info.message}\nmetadata=${JSON.stringify(info.metadata, null, 2)}`,
          ),
        ),
      }),
    ],
  });
}
