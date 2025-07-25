import winston from 'winston';

const config = {
  level: process.env['NODE_ENV'] === 'production' ? 'info' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  defaultMeta: { service: 'aialpha-backend' },
  transports: [
    new winston.transports.Console(),
  ],
};

export const logger = winston.createLogger(config);
