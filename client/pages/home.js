var css = require('sheetify');
var html = require('choo/html');
var note = require('../elements/note');


function searchForm (state, send) {

  function handleSubmit(e) {
    e.preventDefault();
    send('search', document.getElementById('searchField').value);
  }

  var platformUserName = state.platform == 'pc' ? 'Origin' :
                         state.platform == 'ps4' ?    'PSN' :
                         state.platform == 'xbox' ?   'xbox' : null;

  return html`
    <form onsubmit=${handleSubmit} class="search-form">
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
      <main class="site-main">
        <header class="text-align-center">
          <h1>bfSwag</h1>
          <p>Battlefield 1 forum or bb stats signatures powered by <a href="https://battlefieldtracker.com/">Battlfield Tracker Network</a></p>
          ${state.errorMessage ? note('error', state.errorMessage) : ''}
          ${state.errorMessage && state.platform !== 'pc' ? html`<p>In some cases we cannot get info from ${state.platform} users. You can use your companion ID or generate a name from TRN by <a href="https://trackernetwork.freshdesk.com/support/solutions/articles/19000037920-can-t-find-battlefield-1-stats">clicking here</a></p>` : ''}
          ${state.searching ? progress : searchForm(state, send)}
        </header>
        <section class="text-align-left example-banner">
          <p>Get a forum sig that looks like this:</p>
          <img src="/demo.jpg"/>
        </section>
        <footer class="site-footer">
        <p class="text-sm">© 2017 Matt McFarland - Carefully crafted with ${'<3'} by <a href="https://github.com/MattMcFarland/">Matt McFarland</a></p>
        <p class="text-sm">Battlefield is a registered trademark of Electronic Arts.
        You are viewing an unofficial fan site, without affiliation with Electronic Arts. Electronic Arts owns everything Battlefield related
        - All data retrieved from https://battlefieldtracker.com</p>
        </footer>
      </main>
    `;
}