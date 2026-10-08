const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const handlers={},classes=new Set(),panels={'#chat-panel':{hidden:true},'#privacy-preferences':{hidden:true}},root={hidden:true};let observer;
class IO{constructor(cb){this.cb=cb;observer=this;}observe(){}disconnect(){this.disconnected=true;}}
const document={activeElement:null,querySelector:s=>panels[s]||{},body:{classList:{toggle:(c,on)=>on?classes.add(c):classes.delete(c),remove:c=>classes.delete(c)}},addEventListener:(k,f)=>handlers[k]=f,removeEventListener:k=>delete handlers[k]};
const window={IntersectionObserver:IO},ctx={window,document,queueMicrotask:fn=>fn()};vm.createContext(ctx);vm.runInContext(fs.readFileSync(require('node:path').join(__dirname,'../purchase-dock.js'),'utf8'),ctx);
let dock=window.ChegaPurchaseDock.mount(root);assert.equal(root.hidden,false);assert(classes.has('purchase-dock-visible'));
observer.cb([{isIntersecting:true,intersectionRatio:1}]);assert.equal(root.hidden,true);
observer.cb([{isIntersecting:false,intersectionRatio:0}]);assert.equal(root.hidden,false);
panels['#chat-panel'].hidden=false;handlers['chega:overlay']({detail:true});assert.equal(root.hidden,true);
panels['#privacy-preferences'].hidden=false;panels['#chat-panel'].hidden=true;handlers['chega:overlay']({detail:false});assert.equal(root.hidden,true);
panels['#privacy-preferences'].hidden=true;handlers['chega:overlay']({detail:false});assert.equal(root.hidden,false);
document.activeElement={tagName:'INPUT',type:'search'};handlers.focusin();assert.equal(root.hidden,true);document.activeElement=null;handlers.focusout();assert.equal(root.hidden,false);
dock.destroy();assert(observer.disconnected);assert.equal(Object.keys(handlers).length,0);assert(!classes.has('purchase-dock-visible'));
panels['#privacy-preferences'].hidden=false;dock=window.ChegaPurchaseDock.mount(root);assert.equal(root.hidden,true);dock.destroy();
console.log('PASS: compra móvel respeita ação visível, ajuda, privacidade, teclado e limpeza de rota.');
