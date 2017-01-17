require('./polyfill');

var css = require('sheetify');
var choo = require('choo');
var xhr = require('xhr');
var vex = require('vex-js');
var vexDialog = require('vex-dialog');

css('normalize.css');
css('./styles/main.css');

css('vex-js/dist/css/vex.css');
css('vex-js/dist/css/vex-theme-flat-attack.css');

vex.registerPlugin(vexDialog);
vex.defaultOptions.className = 'vex-theme-flat-attack';

document.addEventListener('click', function (e) {
  if (e.target.className.indexOf('select-all') > -1) {
    e.setSelectionRange(0, e.value.length);
  }
});
var app = choo();

app.model({
  state: {
    platform: window.localStorage.getItem('platform') || 'xbox',
    searchField: '',
    searching: false,
    errorMessage: false
  },
  reducers: {
    updatePlatform: function (state, data) {
      window.localStorage.setItem('platform', data);
      return { platform: data };
    },
    searching: function (state, data) {
      return { searching: true };
    },
    updateSearchField: function (state, data) {
      return { searchField: data };
    },
    reset: function (state, data) {
      return {
        searching: false,
        searchField: ''
      };
    },
    searchError: function (state, data) {
      return {
        searching: false,
        searchField: '',
        errorMessage: 'Could not find ' + data.field + ' for ' + state.platform + ', please review your entry and try again...'
      };
    }
  },
  effects: {
    search: function (state, data, send, done) {
      if (state.searching || !data) {
        return done();
      }
      send('searching', true, function () {
        var relativeUrl = '/simple-banner/' + state.platform + '/' + encodeURI(data) + '.jpg';
        var fullUrl = 'https://bf-swag.herokuapp.com' + relativeUrl;

        xhr.get(relativeUrl, function (err, res, body) {
          if (err || res.statusCode === 404) {
            send('searchError', {status: res.statusCode, field: data}, done);
          } else {
            send('reset', true, function () {
              var copyPasta='[url=https://bf-swag.herokuapp.com][img]' + fullUrl + '[/img][/url]';
              vex.dialog.alert({message: 'Huzza!', input: '<div class="result">' +
                '<img src="' + relativeUrl + '"/>' +
                '<p>Copy the code below and paste it where you wish to show the image</p>' +
                '<p>BBCODE:</p>' +
                '<textarea style="font-size: 16px; font-family: monospace;" rows="3" readonly="true" onclick="this.setSelectionRange(0, this.value.length)">' + copyPasta + '</textarea>' +
              '</div>'});
              done();
            });
          }
        });
      });
    },
    modal: function (state, data, send, done) {
      function onModalClose () {};
      vex.dialog.open(Object.assign({}, { callback: onModalClose }, data));
      done();
    }
  }
});

app.router(['/', require('./pages/home')]);

document.body.appendChild(app.start());
