const Jimp = require("jimp");
const loadBaseAssets = require('./loadBaseAssets');

function bannerCreator (initCallback) {
  loadBaseAssets((err, { baseImg, fonts }) => {
    if (err) return initCallback(err, null);
    const createBanner = (stats, cb) => {
      if (!stats) return cb(new Error("stats undefined", null));
      if (!stats.result) return cb(new Error("result undefined", null));
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

module.exports = bannerCreator;
