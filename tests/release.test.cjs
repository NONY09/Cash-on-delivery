const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.join(__dirname,'..'),{render}=require('../scripts/render.cjs'),{load,validate}=require('../scripts/validate.cjs');
const ctx={window:{}};vm.createContext(ctx);vm.runInContext(fs.readFileSync(path.join(root,'routes.js'),'utf8'),ctx);
const routes=ctx.window.ChegaRoutes;
assert.equal(routes.resolve({pathname:'/produto/resina-extreme/',hash:''}).id,'resina-extreme');
assert.equal(routes.resolve({pathname:'/',hash:'#produto/resina-extreme'}).legacy,true);
assert.equal(routes.resolve({pathname:'/',hash:'#produto/%ZZ'}).type,'missing');
assert.equal(routes.resolve({pathname:'/unknown/',hash:''}).type,'missing');
const {config,site}=load();assert.equal(validate(config,site).length,0);
for(const mutation of [p=>p.offers=[],p=>p.offers[0].quantity=0,p=>p.offers[0].checkoutUrl='https://evil.example/pay',p=>p.image='../secret']){
 const c=JSON.parse(JSON.stringify(config));mutation(c.products[0]);assert(validate(c,site).length>0);
}
for(const product of config.products){
 const route='/produto/'+product.id+'/';const out=render(route).html;
 assert(out.indexOf('class="product-intro"')<out.indexOf('class="product-gallery"'));
 assert(out.includes('id="purchase-dock"'));assert(out.includes('<noscript><div class="offer-links">'));
 const page=fs.readFileSync(path.join(root,'dist',route,'index.html'),'utf8');
 assert(page.includes('rel="canonical" href="'+site.origin+route+'"'));assert(page.includes('property="og:image"'));assert(page.includes(product.name));
 for(const match of page.matchAll(/(?:src|srcset|poster|data-src)="(\/[^"?#]+)"/g))assert(fs.existsSync(path.join(root,'dist',match[1])),match[1]);
}
const home=fs.readFileSync(path.join(root,'dist/index.html'),'utf8');assert(!home.includes('<script defer src="/auth.js"'));assert(!home.includes('<script defer src="/vendor/supabase.js"'));
assert(!fs.existsSync(path.join(root,'dist/tests')));assert(!fs.existsSync(path.join(root,'dist/README.md')));assert(!fs.existsSync(path.join(root,'dist/supabase')));
assert(fs.readFileSync(path.join(root,'dist/conta/index.html'),'utf8').includes('noindex, nofollow'));
assert(fs.readFileSync(path.join(root,'dist/sitemap.xml'),'utf8').includes('/produto/resina-extreme/'));
assert(render('/produto/resina-extreme/').html.includes('Compare:')===false); // Default one-unit kit is not dominated.
console.log('PASS: rotas novas/antigas, validação de cadastro de produtos, HTML real sem JS, metadados, arquivos absolutos e pacote público.');
