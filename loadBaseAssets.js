const Jimp = require('jimp');
const resolvePath = require('path').resolve;

const fonts = {
  fontLg: resolvePath(__dirname, 'fonts/bf/font-bf-lg.fnt'),
  fontMd: resolvePath(__dirname, 'fonts/bf/font-bf-md.fnt'),
  fontSm: resolvePath(__dirname, 'fonts/bf/font-bf-sm.fnt'),
  fontXs: resolvePath(__dirname, 'fonts/bf/font-bf-xs.fnt'),
  fontStrokeLg: resolvePath(__dirname, 'fonts/bf-stroke/font-bf-stroke-lg.fnt'),
  fontStrokeMd: resolvePath(__dirname, 'fonts/bf-stroke/font-bf-stroke-md.fnt'),
  fontStrokeSm: resolvePath(__dirname, 'fonts/bf-stroke/font-bf-stroke-sm.fnt'),
  fontStrokeXs: resolvePath(__dirname, 'fonts/bf-stroke/font-bf-stroke-xs.fnt')
}

function loadFonts (cb) {
  const promises = Object.keys(fonts).map(fontKey => Jimp.loadFont(fonts[fontKey]));
  Promise.all(promises).then(values => {
    const resolvedFonts = Object.keys(fonts).reduce((acc, key, index) => {
      acc[key] = values[index]
      return acc;
    }, {})
    cb(null, resolvedFonts);
  });
}


module.exports = function (cb) {
  loadFonts((err, fonts) => {
    if (err) return cb(err, null);
    Jimp.read(resolvePath(__dirname, "base_bg.png"), function (err, image) {
      if (err) return cb(err, null);
      const baseImg = image.clone()
        .cover(500, 150, Jimp.HORIZONTAL_ALIGN_CENTER | Jimp.VERTICAL_ALIGN_MIDDLE)
        .color([{apply: 'darken', params: ['20']}]);
        cb(null, { baseImg, fonts });
    });
  });
}