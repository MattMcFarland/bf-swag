var css = require('sheetify');
var html = require('choo/html');
var note = require('../elements/note');
var headingStyle = css`
  :host { max-width: 960px; margin: 0 auto; }
  :host header { margin-bottom: 2em; }
  :host h1 { color: #f17f1a; margin: 1em 0 0.5em 0;}
`;

var footerStyle = css`
  :host { max-width: 960px; margin: 40px auto; padding: 40px 0; }
`
var searchFormStyle = css`
  :host { display: block; }
  :host fieldgroup {
    position: relative;
    border-collapse: separate;
    display: inline-table;
    vertical-align: middle;
    width: 90%;
    max-width: 600px;
  }
  :host span, :host input {
    font-size: 20px;
    width: auto;
    display: table-cell;
    background: transparent;
    color: grey;
    background: white;
    min-width: 22px;
    line-height: 2.2em;
    height: 2.2em;
    overflow: hidden;
    cursor: pointer;
    border: thin solid white;
    white-space: nowrap;
    vertical-align: middle;
    border-collapse: separate;
    border-radius: 8px;
  }
  :host span {
    color: #999;
  }
  :host span > i {
    margin-top: 3px;
    display: block;
    margin-bottom: -4px;
  }
  :host input {
    width: 100%;
    padding-left: 0.5em;
  }
  :host span:not(:first-child):not(:last-child), :host input:not(:first-child):not(:last-child) {
    border-radius: 0;
  }
  :host span:first-child, :host input:first-child {
    border-right: 0;
    border-bottom-right-radius: 0;
    border-top-right-radius: 0;
  }
  :host span:last-child, :host input:last-child {
    border-right: 0;
    border-bottom-left-radius: 0;
    border-top-left-radius: 0;
  }
  :host span.active.pc { color: #00AEF0; }
  :host span.active.psn { color: #003791; }
  :host span.active.xbox { color: #107c10; }

`;

var exampleStyle = css`
  :host { max-width: 500px; text-align: left; margin: 50px auto 0 auto; }
`

function searchForm (state, send) {

  function handleSubmit(e) {
    e.preventDefault();
    send('search', document.getElementById('searchField').value);
  }

  var platformUserName = state.platform == 'pc' ? 'Origin' :
                         state.platform == 'ps4' ?    'PSN' :
                         state.platform == 'xbox' ?   'xbox' : null;

  return html`
    <form onsubmit=${handleSubmit} class=${searchFormStyle}>
      <h2 class="hidden">Your sharable BF1 stats image for forums sites, blogs, and community pages.</h2>
      <fieldgroup>
        <span class="pc${state.platform == 'pc' ? " active" : ""}"    onclick=${function () {send('updatePlatform', 'pc')}}><i class="socicon-windows"></i></span>
        <span class="psn${state.platform == 'ps4' ? " active" : ""}"   onclick=${function () {send('updatePlatform', 'ps4')}}><i class="socicon-playstation"></i></span>
        <span class="xbox${state.platform == 'xbox' ? " active" : ""}"  onclick=${function () {send('updatePlatform', 'xbox')}}><i class="socicon-xbox"></i></span>
        <input id="searchField" onupdate=${function (e) { send('updateSearchField', e.target.value)}} autofocus="true" placeholder="Your ${platformUserName} user name or companion id..." value=${state.searchField}>
      </fieldgroup>
    </form>
    `
}

const progress = html`
  <div style="height: 48px">
    <img src="/assets/ellipsis.svg">
  </div>
`



module.exports = function homeView (state, prev, send) {
    return html`
      <main class=${headingStyle}>
        <header class="text-align-center">
          <h1 style="font-size: ${window.innerWidth > 500 ? 6 : 3}em; ">bfSwag</h1>
          <p>Battlefield 1 forum or bb stats signatures powered by <a href="https://battlefieldtracker.com/">Battlfield Tracker Network</a></p>
          ${state.errorMessage ? note('error', state.errorMessage) : ''}
          ${state.errorMessage && state.platform !== 'pc' ? html`<p>In some cases we cannot get info from ${state.platform} users. You can use your companion ID or generate a name from TRN by <a href="https://trackernetwork.freshdesk.com/support/solutions/articles/19000037920-can-t-find-battlefield-1-stats">clicking here</a></p>` : ''}
          ${state.searching ? progress : searchForm(state, send)}
        </header>
        <section class="text-align-left ${exampleStyle}">
          <p>Get a forum sig that looks like this:</p>
          <img src="https://bf-swag.herokuapp.com/simple-banner/pc/SFr_TrenchBoss.jpg"/>
        </section>
        <footer class=${footerStyle}>
        <p class="text-sm">© 2017 Matt McFarland - Carefully crafted with ${'<3'} by <a href="https://github.com/MattMcFarland/">Matt McFarland</a></p>
        <p class="text-sm">Battlefield is a registered trademark of Electronic Arts.
        You are viewing an unofficial fan site, without affiliation with Electronic Arts. Electronic Arts owns everything Battlefield related
        - All data retrieved from https://battlefieldtracker.com</p>
        </footer>
      </main>
    `;
}