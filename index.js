const assert = require('assert');
const warn = require('./warn.js');

// REQUIRED TRN_API_KEY - fail application start if not set
assert(process.env.TRN_API_KEY, 'Environment variable TRN_API_KEY is required. Get yours for free at https://battlefieldtracker.com/site-api');

/* Verify optional configuration and set fallbacks/defaults */

// Environment
warn(process.env.NODE_ENV, 'Environment is falling back to "development" because the environment variable NODE_ENV is not defined');
if (!process.env.NODE_ENV) process.env.NODE_ENV = 'development';

// Host and IP
warn(process.env.IP || process.env.HOST, 'IP is falling back to 0.0.0.0 because either environment variable IP or HOST are not defined');
if (!process.env.IP) process.env.IP = '0.0.0.0';
if (!process.env.HOST) process.env.HOST = process.env.IP;
warn(process.env.PORT, 'Port is falling back to 3000 because the environment variable PORT is not defined');
if (!process.env.PORT) process.env.PORT = 3000;

// Redis
warn(process.env.REDIS_URL, 'Redis Cache disabled - Environment variable REDIS_URL is not defined. Local cache will still be used and you can ignore this if you do not want to use REDIS.');

// Keen IO (analytics)
warn(process.env.KEEN_PROJECT_ID, 'Keen analytics disabled - Environment Variable KEEN_PROJECT_ID is not defined. You can ignore this if you do not want to use keen analytics.');
warn(process.env.KEEN_WRITE_KEY, 'Keen analytics disabled - Environment Variable KEEN_WRITE_KEY is not defined. You can ignore this if you do not want to use keen analytics.');

/* Fire up the server */
const server = require('./server');

console.time('boot time');
server.start((err, message) => {
  if (err) {
    throw err;
  }
  console.timeEnd('boot time');
  console.log(message);
});

