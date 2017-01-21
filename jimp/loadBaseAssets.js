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
};

function loadFonts (cb) {
  console.log('Loading bitmap fonts....');
  const promises = Object.keys(fonts).map(fontKey => Jimp.loadFont(fonts[fontKey]));
  Promise.all(promises).then(values => {
    const resolvedFonts = Object.keys(fonts).reduce((acc, key, index) => {
      acc[key] = values[index];
      return acc;
    }, {});
    cb(null, resolvedFonts);
  });
}


module.exports = function (cb) {
  console.log('Initializing banner creation service...');
  loadFonts((err, fonts) => {
    if (err) return cb(err, null);
    console.log('Bitmap fonts loaded!');
    console.log('Loading base background....');
    Jimp.read(resolvePath(__dirname, "rendition1.img.jpg"), function (err, image) {
      if (err) {
        console.log(err);
        return cb(err, null);
      }
      const baseImg = image.clone()
        .cover(500, 150, Jimp.HORIZONTAL_ALIGN_CENTER | Jimp.VERTICAL_ALIGN_MIDDLE)
        .color([{apply: 'darken', params: ['15']}]);
      console.log('Banner creation service initialized...');
      cb(null, { baseImg, fonts });
    });
  });
};
