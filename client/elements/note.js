var html = require('choo/html');

module.exports = function (type, message) {
    return html`
    <aside class="box-${type}">${message}</aside>`
}