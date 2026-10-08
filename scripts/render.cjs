/* Renderização estática das mesmas funções da vitrine. Sem navegador ou rede. */
const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..');
function render(route) {
  const nodes = new Map();
  class Node {
    constructor() { this.innerHTML='';this.textContent='';this.hidden=true;this.dataset={};this.clientWidth=320;this.attrs={};this.classList={add(){},remove(){},toggle(){}}; }
    querySelector(selector){return get(selector);} querySelectorAll(){return [];}
    setAttribute(key,value){this.attrs[key]=value;} getAttribute(key){return this.attrs[key] || null;}
    addEventListener(){} removeEventListener(){} focus(){} scrollIntoView(){} scrollTo(){} pause(){}
  }
  const get = selector => { if(!nodes.has(selector))nodes.set(selector,new Node());return nodes.get(selector); };
  const document={querySelector:get,querySelectorAll:()=>[],getElementById:id=>get('#'+id),body:new Node(),documentElement:new Node(),addEventListener(){},dispatchEvent(){}};
  const location={pathname:route,hash:'',origin:'https://cchega.netlify.app',protocol:'https:'};
  const window={CHEGA_PRERENDER:true,addEventListener(){},matchMedia:()=>({matches:true}),scrollTo(){}};
  const context={window,document,location,localStorage:{removeItem(){}},requestAnimationFrame:fn=>fn(),CustomEvent:class{},Intl,Date,URL,setTimeout(){},clearTimeout(){}};
  vm.createContext(context);
  for(const file of ['site-config.js','routes.js','products.js','store.js','app.js'])vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),context,{filename:file});
  return { html:get('#main').innerHTML,title:document.title,config:window.CHEGA_CONFIG,site:window.CHEGA_SITE };
}
module.exports={render};
