const assert = require('assert');
const BattlefieldStats = require('battlefield-stats');
const merry = require('merry');
const Cache = require('./cache');
const initBannerCreator = require('./jimp/bannerCreator');
const http = require('http');
const url = require('url');
const clientPath = require('path').join(__dirname, 'client');
const renderStatic = require('./static');
const bankai = require('bankai');
const es2020 = require('es2020');

const assets = bankai(clientPath, {
  optimize: process.env.NODE_ENV === 'production',
  html: {
    js: {transform: ['es2020']},
    title: 'Battlefield Signature Swag - Swag for forums and such',
    script: '/swag.js',
    css: '/swag.css',
    head: require('./html-header-inject')
  }
});

function initialize ({ createBanner }, readyUp) {

  const bf = new BattlefieldStats(process.env.TRN_API_KEY);
  const app = merry();
  const mw = merry.middleware;
  const cache = Cache(app);

  app.router([
    ['/', render('html')],
    ['/swag.css', render('css')],
    ['/swag.js', render('js')],
    ['/assets/:file', renderStatic],
    ['/api', [
      ['/stats', [
        ['/pc/:personaIdOrDisplayName', mw([configureContextByPlatform('PC'), renderStats])],
        ['/xbox/:personaIdOrDisplayName', mw([configureContextByPlatform('XBOX'), renderStats])],
        ['/ps4/:personaIdOrDisplayName', mw([configureContextByPlatform('PS4'), renderStats])]
      ]],
    ]],
    ['/simple-banner', [
      ['/pc/:personaIdOrDisplayName', mw([configureContextByPlatform('PC'), renderSimpleBanner])],
      ['/xbox/:personaIdOrDisplayName', mw([configureContextByPlatform('XBOX'), renderSimpleBanner])],
      ['/ps4/:personaIdOrDisplayName', mw([configureContextByPlatform('PS4'), renderSimpleBanner])]
    ]],
    ['/404', merry.notFound()]
  ]);


  function render(method) {
    assert(typeof assets[method] === 'function');
    return (req, res, ctx, done) => done(null, assets[method](req, res).pipe(res));
  }

  function renderSimpleBanner (req, res, ctx, done) {
    getSimpleBannerImageData (ctx, (error, imageData) => {
      if (error || !imageData) {
        return done(error || new Error('Unknown'));
      }
      if (res._header) {
        app.log.warn('headers were already sent');
      } else {
        const t1 = Date.now();
        app.log.info({name: 'renderSimpleBanner', time: t1-ctx.t0});
        res.setHeader('Content-Type', 'image/jpeg');
        res.end(imageData, done);
      }
    });
  }

  function renderStats (req, res, ctx, done) {
    getStats(ctx, done);
  }

  function configureContextByPlatform (platform) {
    const isNumeric = n => (!isNaN(parseFloat(n)) && isFinite(n));
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

    return (req, res, ctx, done) => {
      ctx.t0 = Date.now();
      ctx.persona = normalizePersona(ctx.params.personaIdOrDisplayName);
      ctx.bfPlatform = bf.Platforms[platform];
      ctx.bfParams = setParams(ctx.persona, { platform: ctx.bfPlatform });
      done();
    };
  }

  function getStats (ctx, cb) {
    const statsKey = `${ctx.bfPlatform}_${ctx.persona}_st`;

    cache.get(statsKey, (error, cachedStats) => {
      if (error || !cachedStats) {
         bf.Stats.basicStats(ctx.bfParams, (error, freshStats) => {
           app.log.info({name: 'bfApi', params: ctx.bfParams});
           if (error || !freshStats) {
             return cb(merry.error({statusCode: 404, message: ""}), null);
           }
           cache.set(statsKey, JSON.stringify(freshStats));
           cb(null, freshStats);
         });
      } else {
        cb(null, JSON.parse(cachedStats));
      }

    });
  }

  function getSimpleBannerImageData (ctx, cb) {
    if (!ctx.persona || !ctx.bfPlatform) {
      cb(new Error('malformed request'), null);
    }
    const simpleBannerKey = `${ctx.bfPlatform}_${ctx.persona}_im`;

    cache.get(simpleBannerKey, (error, cachedImage) => {
      if (error || !cachedImage) {
         getStats(ctx, (error, stats) => {
          if (error || !stats) {
            return cb(error, null);
          }
          const t0 = Date.now();
          createBanner(stats, (error, newImage) => {
            const t1 = Date.now();
            app.log.debug({name: 'createBanner', time: t1 - t0});
            if (error || !newImage) {
              return cb(error, null);
            }
            cache.set(simpleBannerKey, newImage);
            cb(null, newImage);
          });
        });
      } else {
        cb(null, cachedImage);
      }
    });

  }

  readyUp(app);
}

module.exports = function (done) {
  const host = process.env.IP || process.env.HOST;
  const port = process.env.PORT;
  const environment = process.env.NODE_ENV || 'development';

  initBannerCreator((err, dependencies) => {
    if (err) return done(err, null);
    initialize(dependencies, (app) => {
      const server = http.createServer(app.start());
      server.listen(process.env.PORT, process.env.HOST, 0, (err) => {
        if (err) return done(err, null);
        return done(null, (`started and listening at ${host}:${port} in ${environment}`));
      });
    });
  });
};

