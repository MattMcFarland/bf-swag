const assert = require('assert');

assert(process.env.REDIS_URL, 'Environment variable REDIS_URL is required');
assert(process.env.TRN_API_KEY, 'Environment variable TRN_API_KEY is required');
assert(process.env.PORT, 'Environment variable PORT is required');
assert(process.env.IP || process.env.HOST, 'Either Environment variable IP or HOST required');

if (!process.env.HOST) process.env.HOST = process.env.IP;
if (!process.env.NODE_ENV) process.env.NODE_ENV = 'development';

const server = require('./server');

server((err, message) => {
  if (err) {
    throw err;
  }
  console.log(message);
});

