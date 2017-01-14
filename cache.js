const levelup = require('level');
const ttl = require('level-ttl');
const Redis = require('redis');

function Cache (app) {
  const db = levelup(`/tmp/cache.db`, {valueEncoding: 'binary'});
  const redis = Redis.createClient(process.env.REDIS_URL, { return_buffers: true });
  const local = ttl(db);

  function get (key, cb) {
    const t0 = Date.now();
    local.get(key, handleLocalResult);

    function handleLocalResult(err, resultFromLocal) {
      if (err || !resultFromLocal) {
        redis.get(key, handleResultFromRedis);
      } else {
        const t1 = Date.now();
        app.log.info({name: 'Cache', key, origin: 'leveldb', time: t1 - t0});

        cb(null, resultFromLocal);
      }
    }

    function handleResultFromRedis(err, resultFromRedis) {
      if (err || !resultFromRedis) {
        cb(err);
      } else {
        const t1 = Date.now();
        app.log.info({name: 'Cache', key, origin: 'redis', time: t1 - t0});
        cb(null, resultFromRedis);
        redis.ttl(key, (err, redisKeyTTL) => {
          if (!err) {
            local.put(key, resultFromRedis);
            local.ttl(key, redisKeyTTL);
          }
        });
      }
    }
  }

  function set (key, value) {
    const inTwentyFourHours = parseInt((+new Date)/1000, 10) + 86400;
    redis.set(key, value);
    redis.expireat(key, inTwentyFourHours);
    local.put(key, value);
    local.ttl(key, inTwentyFourHours);
  }

  return { get, set };
}



module.exports = Cache;


