const stream = require('stream');
const split2 = require('split2');
const tee = require('tee');
const Keen = require('keen-js');

const keen = (process.env.KEEN_PROJECT_ID && process.env.KEEN_WRITE_KEY) ? new Keen({
  projectId: process.env.KEEN_PROJECT_ID,
  writeKey: process.env.KEEN_WRITE_KEY
}) : null;

function sendToKeen (obj) {
  const key = obj.name === 'http' && obj.message === 'request' ? 'hit' :
              obj.name ? obj.name :
              'log';

  keen.addEvent(key, obj, (err) => {
    if (err) {
      console.log(JSON.stringify(err));
    }
  });
}

module.exports = keen ? new stream
  .PassThrough()
  .pipe(tee(
    split2(JSON.parse)
      .on('data', sendToKeen),
    process.stdout
  )) : new stream.PassThrough().pipe(process.stdout);
