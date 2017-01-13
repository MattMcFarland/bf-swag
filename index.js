const assert = require('assert');
const BattlefieldStats = require('battlefield-stats');
const express = require('express');
const app = express();
const Jimp = require("jimp");
const loadBaseAssets = require('./loadBaseAssets');
const redis = require('redis');
const storage = require('node-persist');

assert(process.env.REDIS_URL, 'Environment variable REDIS_URL is required');
assert(process.env.TRN_API_KEY, 'Environment variable TRN_API_KEY is required');
assert(process.env.PORT, 'Environment variable PORT is required');
assert(process.env.IP || process.env.HOST, 'Either Environment variable IP or HOST required');

if (!process.env.HOST) process.env.HOST = process.env.IP;
if (!process.env.NODE_ENV) process.env.NODE_ENV = 'development';

const apiKey = process.env.TRN_API_KEY;
const host = process.env.IP || process.env.HOST;
const port = process.env.PORT;
const environment = process.env.NODE_ENV || 'development';
const redisClient = redis.createClient(process.env.REDIS_URL, { return_buffers: true });

const bf = new BattlefieldStats(apiKey);

storage.initSync({ttl: true});

function persistData(key, value) {
  const inTwentyFourHours = parseInt((+new Date)/1000) + 86400;
  redisClient.set(key, value);
  redisClient.expireat(key, inTwentyFourHours);
  storage.setItem(key, value);
}

function isNumeric(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

const setParams = (persona, params) => (isNumeric(persona))
  ? Object.assign({}, {personaId: persona}, params)
  : Object.assign({}, {displayName: persona}, params);

const normalizePersona = (persona) => {
  // failsafe that allows the persona to tail with .png for 3rd party apps
  try {
    return persona.indexOf('.jpg') === -1 ? persona : persona.split('.jpg')[0];
  } catch (e) {
    return persona;
  }
};

function initialize ({ createBanner }, done) {
  app.get('/', function (req, res, next) {
    res.send({status: 'online'});
  });

  const simpleBanner = express.Router();
  simpleBanner.get('/', function (req, res, next) {
    res.send({status: 'online'});
  });

  simpleBanner.get('/pc/:image', function (req, res, next) {
    req.persona = normalizePersona(req.params.image);
    req.bfPlatform = bf.Platforms.PC;
    req.bfParams = setParams(req.persona, { platform: req.bfPlatform });
    next();
  });

  simpleBanner.get('/xbox/:image', function (req, res, next) {
    req.persona = normalizePersona(req.params.image);
    req.bfPlatform = bf.Platforms.XBOX;
    req.bfParams = setParams(req.persona, { platform: bf.Platforms.XBOX });
    next();
  });

  simpleBanner.get('/ps4/:image', function (req, res, next) {
    req.persona = normalizePersona(req.params.image);
    req.bfPlatform = bf.Platforms.PS4;
    req.bfParams = setParams(req.persona, { platform: bf.Platforms.PS4 });
    next();
  });

  simpleBanner.use(function (req, res, next) {
    const dump = message => ({message, path: req.path, params: req.params, persona: req.persona, bfParams: req.bfParams});

    if (!req.persona && !req.bfParams) return res.send(400, dump('invalid request'));
    req.statsKey = `${req.bfPlatform}_${req.persona}_bfStatsKey`;
    req.simpleBannerKey = `${req.bfPlatform}_${req.persona}_bfSimpleBannerImageKey`;
    next();
  });

  // Get image from memory
  simpleBanner.use(function getImageFromMemory (req, res, next) {
    storage.getItem(req.simpleBannerKey, (error, cachedImage) => {
      if (!error && cachedImage) {
        res.type('jpg');
        res.end(cachedImage, 'binary');
      } else {
        next();
      }
    });
  });

  // If image is not in memory, pull from redis
  simpleBanner.use(function getImageFromRedis (req, res, next) {
    redisClient.get(req.simpleBannerKey, (error, cachedImage) => {
      if (!error && cachedImage) {
        res.type('jpg');
        res.end(cachedImage, 'binary');
      } else {
        next();
      }
    });
  });

  // Get stats so we can create the image from scratch

  // Pull stats from memory if they exist
  simpleBanner.use(function pullStatsFromMemory (req, res, next) {
    storage.getItem(req.statsKey, (error, cachedStats) => {
      if (!error && cachedStats) {
        createBanner(JSON.parse(cachedStats), (error, newImage) => {
          if (!error && newImage) {
            res.type('jpg');
            res.end(newImage, 'binary');
            persistData(req.simpleBannerKey, newImage);
          } else {
            next();
          }
        });
      } else {
        next();
      }
    });
  });

  // Pull stats from memory if they exist
  simpleBanner.use(function pullStatsFromRedis (req, res, next) {
    redisClient.get(req.statsKey, (error, cachedStats) => {
      if (!error && cachedStats) {
        createBanner(JSON.parse(cachedStats.toString()), (error, newImage) => {
          if (!error && newImage) {
            res.type('jpg');
            res.end(newImage, 'binary');
            persistData(req.simpleBannerKey, newImage);
          } else {
            next();
          }
        });
      } else {
        next();
      }
    });
  });

  // If stats are not in redis, then pull stats from TRN
  simpleBanner.use(function pullStatsFromTRN (req, res, next) {
    bf.Stats.basicStats(req.bfParams, (error, freshStats) => {
      if (!error && freshStats) {
        createBanner(freshStats, (error, newImage) => {
          if (!error && newImage) {
            res.type('jpg');
            res.end(newImage, 'binary');
            persistData(req.simpleBannerKey, newImage);
            persistData(req.statsKey, JSON.stringify(freshStats));
          } else {
            next();
          }
        });
      } else {
        next();
      }
    });
  });

  app.use('/simple-banner', simpleBanner);
  done(app);
}

//

function initBannerCreator (initCallback) {
  loadBaseAssets((err,  { baseImg, fonts }) => {
    if (err) return initCallback(err, null);
    const createBanner = (stats, cb) => {
      if (!stats) return cb(new Error("stats undefined", null));

      Jimp.read(stats.bbPrefix + stats.result.rank.imageUrl.split('[BB_PREFIX]')[1], (err, rankImage) => {
        if (err) return cb(err, null);
        const fittedRankImage = rankImage.clone().resize(150, 150);
        const round = (n) => (Math.round(n * 100) / 100).toFixed(2);
        const totalGamesPlayed = (stats.result.wins + stats.result.losses);
        const winningPercentage = Math.round((stats.result.wins / totalGamesPlayed) * 100).toFixed(0) + '%';
        const kd = round(stats.result.kills / stats.result.deaths).toString();

        baseImg.clone()
          .composite(fittedRankImage, 10, 0)
          .print(fonts.fontSm, 14, 120, stats.result.rank.name, 150)
          .print(fonts.fontStrokeMd, 14, 0, stats.profile.displayName, 150)
          .print(fonts.fontStrokeMd, 210, 40, 'spm')
          .print(fonts.fontSm, 220, 80, Math.ceil(Math.max(stats.result.spm)).toString())
          .print(fonts.fontStrokeMd, 314, 40, 'k/d')
          .print(fonts.fontSm, 320, 80, kd)
          .print(fonts.fontStrokeMd, 410, 40, 'wins')
          .print(fonts.fontSm, 430, 80, winningPercentage)
          .quality(90)
          .getBuffer( 'image/jpeg', cb );
      });
    };
    initCallback(null, { createBanner });
  });
}

initBannerCreator((err, dependencies) => {
  if (err) throw new Error(err);
  initialize(dependencies, (app) => {
    app.listen(port, host, (err, res) => {
      if (err) throw new Error(err);
      console.log('server initialized');
      console.log(`Listening at ${host}:${port} in ${environment}`);
    });
  });

});

