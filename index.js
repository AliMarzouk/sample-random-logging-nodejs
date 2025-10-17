const winston = require('winston');

// Configure Winston to log JSON into a single combined file
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'combined.log' })
  ],
  exceptionHandlers: [
    new winston.transports.File({ filename: 'combined.log' })
  ],
  rejectionHandlers: [
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

// Random messages to log
const messages = [
  'User signed in',
  'Cache refreshed successfully',
  'Background job completed',
  'Configuration loaded',
  'API request processed',
  'Disk space low',
  'Timeout while calling external service',
  'Database connection established',
  'Payment processed',
  'Email queued for sending'
];

// Levels to rotate through: info -> warn -> error -> repeat
const levels = ['info', 'warn', 'error'];
let levelIndex = 0;

function getRandomMessage() {
  const index = Math.floor(Math.random() * messages.length);
  return messages[index];
}

function logNext() {
  const level = levels[levelIndex % levels.length];
  const message = getRandomMessage();
  const meta = { service: process.env.SERVICE_NAME, iteration: levelIndex };

  if (level === 'error') {
    // Include an Error instance to ensure stack and error fields are present
    const err = new Error(message);
    logger.error(message, { ...meta, error: { message: err.message, stack: err.stack, name: err.name } });
  } else if (level === 'warn') {
    logger.warn(message, meta);
  } else {
    logger.info(message, meta);
  }

  levelIndex += 1;
}

// Immediately log the first message, then every 30 seconds
logNext();
setInterval(logNext, 30 * 1000);

// Graceful shutdown handling
function shutdown() {
  // winston 3 flushes on transport end; close all transports
  logger.end && logger.end();
  for (const transport of logger.transports) {
    if (typeof transport.close === 'function') {
      transport.close();
    }
  }
  process.exit(0);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);


