module.exports = `
<script type="text/javascript">
  function createKeenWebAutoCollector(){window.keenWebAutoCollector=window.KeenWebAutoCollector.create({projectId:'5878f0eb8db53dfda8a832ba',writeKey:'33C3B315BC9E7CC73ED5E2273294A3BC3C13D0E95AB0AE163DC05D60133E0E296AA1BFA7246911E1D0EC6CE8C648E521CF0E865EF85CE51E1B2F168CA83D9596720355E1D89A4F6BDD4BDB040CC0EC529A3CC862FCE5FAB9936064D347C48BE7',onloadCallbacks:window.keenWebAutoCollector.onloadCallbacks}),window.keenWebAutoCollector.loaded()}function initKeenWebAutoCollector(){window.keenWebAutoCollector.domReady()?window.createKeenWebAutoCollector():document.addEventListener("readystatechange",function(){window.keenWebAutoCollector.domReady()&&window.createKeenWebAutoCollector()})}window.keenWebAutoCollector={onloadCallbacks:[],onload:function(a){this.onloadCallbacks.push(a)},domReady:function(){return["ready","complete"].indexOf(document.readyState)>-1}};
</script>
<script async type="text/javascript" src="https://d26b395fwzu5fz.cloudfront.net/keen-web-autocollector-1.0.7.min.js" onload="initKeenWebAutoCollector()"></script>
`;
