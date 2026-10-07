/* Verificação de lógica e HTML gerado; não substitui teste visual em navegador. */
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const root=path.join(__dirname,'..');
const staticHTML=fs.readFileSync(path.join(root,'index.html'),'utf8');
const nodes=new Map(),docEvents={},winEvents={},storage=new Map([['chega-cart-v1','old cart'],['unrelated','keep']]);
const sources=['products.js','store.js','app.js'].map(name=>fs.readFileSync(path.join(root,name),'utf8'));
class Element {
 constructor(){this.innerHTML='';this.textContent='';this.dataset={};this.attrs={};this.handlers={};this.classList={add(){},remove(){},toggle(){}};this.clientWidth=320;this.scrollLeft=0;this.open=false;this.hidden=false;this.loads=0;this.pauses=0;}
 setAttribute(k,v){this.attrs[k]=v;} getAttribute(k){return k==='src'?this.src||null:this.attrs[k]||null;}
 addEventListener(k,f){this.handlers[k]=f;} querySelector(s){return get(s);} querySelectorAll(){return [];}
 focus(){} scrollIntoView(){} scrollTo(o){this.scrollLeft=o.left;} load(){this.loads++;} pause(){this.pauses++;}
}
const html=()=>staticHTML+' '+[...nodes.values()].map(n=>n.innerHTML).join(' ');
const get=s=>{
 if(/^#[\w-]+$/.test(s)&&!html().includes(`id="${s.slice(1)}"`))return null;
 if(!nodes.has(s))nodes.set(s,new Element());return nodes.get(s);
};
const document={querySelector:get,querySelectorAll:()=>[],getElementById:id=>get('#'+id),body:new Element(),addEventListener:(k,f)=>docEvents[k]=f};
const window={addEventListener:(k,f)=>winEvents[k]=f,matchMedia:()=>({matches:true}),scrollTo(){}};
const ctx={window,document,location:{hash:'#catalogo'},localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v),removeItem:k=>storage.delete(k)},requestAnimationFrame:f=>f(),setTimeout:()=>0,clearTimeout(){},Intl,Date,URL};
vm.createContext(ctx);vm.runInContext(sources[0],ctx);const config=window.CHEGA_CONFIG,real=config.products[0];
// Fixture-only products exercise catalog growth, categories, accents and HTML escaping.
for(let i=1;i<=24;i++)config.products.push({...real,id:'test-'+i,name:i===1?'Organização & <limpeza>':'Produto '+i,category:i%2?'Casa':'Auto',imageAlt:'Imagem do produto de teste',summary:'Descrição de teste',video:null,images:undefined,details:undefined,faq:undefined});
vm.runInContext(sources[1],ctx);vm.runInContext(sources[2],ctx);
assert.equal(storage.has('chega-cart-v1'),false);assert.equal(storage.get('unrelated'),'keep');
assert(!staticHTML.includes('cart-dialog'));assert(!staticHTML.includes('cart-trigger'));
const cards=()=>[...get('#product-grid').innerHTML.matchAll(/class="product-card"/g)].length;
const click=(selector,dataset)=>docEvents.click({target:{closest:s=>s===selector?{dataset}:null},preventDefault(){}});
assert.equal(cards(),12);assert.equal(get('#catalog-more').hidden,false);assert.equal(get('#search-status').textContent,'12 de 25 produtos');
click('[data-action]',{action:'more-products'});assert.equal(cards(),24);assert.equal(get('#catalog-more').hidden,false);
click('[data-action]',{action:'more-products'});assert.equal(cards(),25);assert.equal(get('#catalog-more').hidden,true);
click('[data-category]',{category:'Casa'});assert.equal(cards(),12);assert.equal(get('#search-status').textContent,'12 de 12 produtos · Casa');
assert(get('#product-grid').innerHTML.includes('Organização &amp; &lt;limpeza&gt;'));assert(!get('#product-grid').innerHTML.includes('href="#produto/test-2"'));
get('#search-input').value='organizacao';get('#search-form').handlers.submit({preventDefault(){}});assert.equal(cards(),1);assert.equal(get('#catalog-more').hidden,true);
get('#search-input').value='inexistente';get('#search-form').handlers.submit({preventDefault(){}});assert.equal(cards(),0);assert(get('#product-grid').innerHTML.includes('Nenhum produto encontrado'));
click('[data-action]',{action:'reset-filters'});assert.equal(cards(),12);
const route=id=>{ctx.location.hash='#produto/'+id;winEvents.hashchange();};route(real.id);
assert(!get('#main').innerHTML.includes('Adicionar ao carrinho'));assert(get('#main').innerHTML.includes(real.offers[0].checkoutUrl));
const checkout=window.ChegaStore.checkout;
const expected=[9999,12499,14700,19700,18000,21000];
for(const [i,offer] of real.offers.entries()){
 assert.equal(offer.priceCents,expected[i]);assert.equal(checkout(real.id,offer.id),offer.checkoutUrl);
 docEvents.change({target:{name:'offer',value:offer.id}});
 assert(get('#purchase-action').innerHTML.includes(offer.checkoutUrl));assert(get('#purchase-action').innerHTML.includes('noopener noreferrer'));
 assert.equal(get('#offer-price').textContent,new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(offer.priceCents/100));
}
assert.equal(checkout(real.id,'invalid'),null);assert.equal(checkout('invalid',real.offers[0].id),null);
config.demoMode=true;assert.equal(checkout(real.id,real.offers[0].id),null);config.demoMode=false;
real.demo=true;assert.equal(checkout(real.id,real.offers[0].id),null);real.demo=false;
const old=real.offers[0].checkoutUrl;for(const bad of ['http://example.com','javascript:alert(1)','https://name:password@example.com']){real.offers[0].checkoutUrl=bad;assert.equal(checkout(real.id,real.offers[0].id),null);}real.offers[0].checkoutUrl=old;
route('test-2');assert(get('#main').innerHTML.includes('Produto 2'));assert(!get('#main').innerHTML.includes('id="product-video"'));assert(!get('#main').innerHTML.includes('Resina Extreme'));
route('missing');assert(get('#main').innerHTML.includes('Esse produto não foi encontrado'));
ctx.location.hash='#conta';winEvents.hashchange();assert(get('#main').innerHTML.includes('Não foi possível carregar o acesso'));assert(!get('#main').innerHTML.includes('type="password"'));
console.log('PASS: 25 produtos de teste, lotes 12/24/25, filtros, busca, escape, 6 checkouts, bloqueios, páginas opcionais e conta.');
