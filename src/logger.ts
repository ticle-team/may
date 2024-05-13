import { createLogger, transports, format } from 'winston';

export function getLogger(label: string) {
  return createLogger({
    transports: [
      new transports.Console({
        level: 'debug',
        format: format.combine(
          format.padLevels({
            levels: {
              error: 0,
              warn: 1,
              info: 2,
              http: 3,
              verbose: 4,
              debug: 5,
              silly: 6,
            },
          }),
          format.label({ label }),
          format.timestamp({
            format: 'YYYY-MM-DD HH:mm:ss',
          }),
          format.colorize({
            level: true,
          }),
          format.printf(
            (info) =>
              `${info.timestamp} ${info.level} [${info.label}] -- ${info.message}`,
          ),
        ),
      }),
    ],
  });
}
