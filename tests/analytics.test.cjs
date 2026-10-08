const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
function fixture(config={},saved=null){
 const handlers={},scripts=[],storage=new Map(),panel={hidden:true,querySelector:()=>({focus(){}})},open={hidden:true};
 if(saved)storage.set('chega-privacy-v1',JSON.stringify(saved));
 const nodes={'#privacy-preferences':panel,'#privacy-open':open,'#privacy-services':{textContent:''}};
 const window={CHEGA_SITE:{analytics:config},location:{reload(){window.reloaded=true;}}};
 const document={querySelector:s=>nodes[s],activeElement:null,head:{append:s=>scripts.push(s.src)},createElement:()=>({}),addEventListener:(k,f)=>handlers[k]=f,dispatchEvent(){}};
 const ctx={window,document,localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)},CustomEvent:class{},Date,JSON};vm.createContext(ctx);vm.runInContext(fs.readFileSync(require('node:path').join(__dirname,'../analytics.js'),'utf8'),ctx);
 const click=selector=>handlers.click({target:{closest:s=>s===selector?{}:null}});
 return {window,document,scripts,panel,open,click,storage};
}
let f=fixture();assert.equal(f.window.ChegaAnalytics.configured,false);assert.equal(f.scripts.length,0);assert.equal(f.open.hidden,true);
f=fixture({metaPixelId:'123456789',googleMeasurementId:'G-TEST123'});assert.equal(f.scripts.length,0);assert.equal(f.panel.hidden,false);
f.window.ChegaAnalytics.track('checkout_redirect',{id:'p',name:'P',category:'C'},{id:'o',quantity:2,priceCents:100});assert.equal(f.scripts.length,0);
f.click('[data-privacy-reject]');assert.equal(f.scripts.length,0);assert.equal(JSON.parse(f.storage.get('chega-privacy-v1')).analytics,false);
f.click('[data-privacy-open]');f.click('[data-privacy-accept]');assert.equal(f.scripts.length,2);
f.window.ChegaAnalytics.track('checkout_redirect',{id:'p',name:'P',category:'C'},{id:'o',quantity:2,priceCents:100});
assert(f.window.fbq.queue.some(args=>args[1]==='checkout_redirect'));const n=f.window.fbq.queue.length;
f.window.ChegaAnalytics.track('Purchase');assert.equal(f.window.fbq.queue.length,n);
f.click('[data-privacy-reject]');assert.equal(f.window.reloaded,true);
f=fixture({metaPixelId:'123456789'},{analytics:true,version:0});assert.equal(f.scripts.length,0);assert.equal(f.panel.hidden,false);
console.log('PASS: nenhuma medição sem IDs ou consentimento; recusa, revogação, renovação e clique separado de venda.');
