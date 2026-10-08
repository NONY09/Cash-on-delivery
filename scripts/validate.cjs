const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.join(__dirname,'..');
function validate(config,site){
 const errors=[];const ids=new Set();
 if(!config.products?.length)errors.push('O catálogo precisa de um produto real.');
 for(const p of config.products || []){
  if(!/^[a-z0-9-]+$/.test(p.id || '')||ids.has(p.id))errors.push('ID inválido ou repetido: '+p.id);ids.add(p.id);
  for(const field of ['name','category','summary','description','image','imageAlt'])if(typeof p[field]!=='string'||!p[field].trim())errors.push(p.id+': campo obrigatório '+field);
  if(!p.offers?.length)errors.push(p.id+': sem oferta');
  const offers=new Set();
  for(const o of p.offers || []){
   if(!o.id||offers.has(o.id))errors.push(p.id+': ID de kit repetido');offers.add(o.id);
   if(!Number.isSafeInteger(o.quantity)||o.quantity<1||!Number.isSafeInteger(o.priceCents)||o.priceCents<=0||!o.label)errors.push(p.id+': quantidade, preço ou nome de kit inválidos');
   try{const u=new URL(o.checkoutUrl);if(u.protocol!=='https:'||u.hostname!=='entrega.logzz.com.br'||u.username||u.password)throw Error();}catch{errors.push(p.id+': link de checkout inválido');}
  }
  const images=[p.image,...(p.images || []).flatMap(i=>[i.src,i.thumbnail].filter(Boolean)),...(p.video?[p.video.src,p.video.poster]:[])];
  for(const asset of images)if(!asset||asset.startsWith('/')||asset.includes('..')||!fs.existsSync(path.join(root,asset)))errors.push(p.id+': arquivo ausente/inválido '+asset);
 }
 try{const u=new URL(site.origin);if(u.protocol!=='https:'||u.pathname!=='/'||u.search||u.hash)throw Error();}catch{errors.push('Origem pública inválida');}
 if(site.analytics.metaPixelId&&!/^\d{5,25}$/.test(site.analytics.metaPixelId))errors.push('ID Meta inválido');
 if(site.analytics.googleMeasurementId&&!/^G-[A-Z0-9]+$/.test(site.analytics.googleMeasurementId))errors.push('ID Google inválido');
 return errors;
}
function load(){const ctx={window:{}};vm.createContext(ctx);for(const f of ['products.js','site-config.js'])vm.runInContext(fs.readFileSync(path.join(root,f),'utf8'),ctx);return {config:ctx.window.CHEGA_CONFIG,site:ctx.window.CHEGA_SITE};}
if(require.main===module){const {config,site}=load();const errors=validate(config,site);if(errors.length){console.error(errors.join('\n'));process.exitCode=1;}else console.log('PASS: produtos, arquivos, preços e links válidos.');}
module.exports={validate,load};
