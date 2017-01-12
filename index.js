const BF = require('battlefield-stats');
const bf = new BF('e88bbefd-ac05-489c-b142-edc24cc42fce');
const app = require('express')();
const Jimp = require("jimp");
const loadBaseAssets = require('./loadBaseAssets');

function isNumeric(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

const setParams = (persona, params) => (isNumeric(persona))
  ? Object.assign({}, {personaId: persona}, params)
  : Object.assign({}, {displayName: persona}, params);


function initialize ({ createBanner }, done) {
  app.use('/pc/:persona', function (req, res, next) {
    const persona = req.params.persona.indexOf('.png') === -1 ? req.params.persona : req.params.persona.split('.png')[0];
    bf.Stats.basicStats(setParams(persona, { platform: bf.Platforms.PC, }), (error, stats) => {
      if (error) return next(error);
      if (req.params.persona.indexOf('.png') === -1) return res.send(stats);
      req.bfStats = stats;
      next();
    });
  });

  app.use('/xbox/:persona', function (req, res, next) {
    const persona = req.params.persona.indexOf('.png') === -1 ? req.params.persona : req.params.persona.split('.png')[0];
    bf.Stats.basicStats(setParams(persona, { platform: bf.Platforms.XBOX, }), (error, stats) => {
      if (error) return next(error);
      if (req.params.persona.indexOf('.png') === -1) return res.send(stats);
      req.bfStats = stats;
      next();
    });
  });

  app.use('/ps4/:persona', function (req, res, next) {
    const persona = req.params.persona.indexOf('.png') === -1 ? req.params.persona : req.params.persona.split('.png')[0];
      bf.Stats.basicStats(setParams(persona, { platform: bf.Platforms.PS4, }), (error, stats) => {
        if (error) return next(error);
        if (req.params.persona.indexOf('.png') === -1) return res.send(stats);
        req.bfStats = stats;
        next();
      });
  });

  app.use(function (req, res, next) {
    createBanner(req.bfStats, (err, binaryImageData) => {
      if (err) return next(err);
      res.type('png');
      res.end(binaryImageData, 'binary');
    });
  });
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
          .getBuffer( 'image/png', cb );
      });
    };
    initCallback(null, { createBanner });
  });
}

initBannerCreator((err, dependencies) => {
  if (err) throw new Error(err);
  initialize(dependencies, (app) => {
    app.listen(8080, (err, res) => {
      if (err) throw new Error(err);
      console.log('server initialized');
    });
  });

});

