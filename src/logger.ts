import { createLogger, format, transports } from 'winston';

export function getLogger(label: string) {
  return createLogger({
    transports: [
      new transports.Console({
        level: process.env.LOG_LEVEL || 'debug',
        format: format.combine(
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
          // format.errors({ stack: true }), // this is not working
          format.printf((info) => {
            let msg = `${info.timestamp} ${info.level} [${info.label}] -- ${info.message}\nmetadata=${JSON.stringify(info.metadata, null, 2)}`;
            let error = info.metadata.error;
            let first = true;
            while (error) {
              msg += '\n';
              if (!first) {
                msg += 'caused by: ';
              }
              msg += `${error.stack}`;
              error = error.cause?.error;
              first = false;
            }
            return msg;
          }),
        ),
      }),
    ],
  });
}
