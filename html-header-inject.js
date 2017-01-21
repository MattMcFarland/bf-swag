const keensScripts = `
<script type="text/javascript">
  function createKeenWebAutoCollector(){window.keenWebAutoCollector=window.KeenWebAutoCollector.create({projectId:'${process.env.KEEN_PROJECT_ID}',writeKey:'${process.env.KEEN_WRITE_KEY}',onloadCallbacks:window.keenWebAutoCollector.onloadCallbacks}),window.keenWebAutoCollector.loaded()}function initKeenWebAutoCollector(){window.keenWebAutoCollector.domReady()?window.createKeenWebAutoCollector():document.addEventListener("readystatechange",function(){window.keenWebAutoCollector.domReady()&&window.createKeenWebAutoCollector()})}window.keenWebAutoCollector={onloadCallbacks:[],onload:function(a){this.onloadCallbacks.push(a)},domReady:function(){return["ready","complete"].indexOf(document.readyState)>-1}};
</script>
<script async type="text/javascript" src="https://d26b395fwzu5fz.cloudfront.net/keen-web-autocollector-1.0.7.min.js" onload="initKeenWebAutoCollector()"></script>
<script src="//cdn.jsdelivr.net/keen.js/3.4.1/keen.min.js" type="text/javascript"></script>
<script type="text/javascript">
  window.keen = new Keen({projectId:'${process.env.KEEN_PROJECT_ID}',writeKey:'${process.env.KEEN_WRITE_KEY}' });
</script>
`;

module.exports = `
<link href="https://file.myfontastic.com/n6vo44Re5QaWo8oCKShBs7/icons.css" rel="stylesheet">
${process.env.KEEN_PROJECT_ID && process.env.KEEN_WRITE_KEY ? keensScripts : ''}
`;
