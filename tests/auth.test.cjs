/* Adapter tests for account flows; real RLS is tested separately in Supabase. */
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync(path.join(__dirname,'..','auth.js'),'utf8');
(async()=>{
 const elements=new Map(),handlers={},calls=[];let user=null,profile=null,callback;
 class Element {constructor(){this.innerHTML='';this.textContent='';this.attrs={};this.dataset={};this.value='';}setAttribute(k,v){this.attrs[k]=v;}focus(){}querySelectorAll(){return [];}closest(){return null;}}
 const get=s=>{if(!elements.has(s))elements.set(s,new Element());return elements.get(s);};
 const config={url:'https://example.supabase.co',publishableKey:'sb_publishable_fixture',privacyVersion:'2026-10-07',publicRegistrationEnabled:false,phoneVerificationEnabled:false,captchaSiteKey:'',signupPauseMessage:'Cadastro aguardando liberação.'};
 const api={auth:{
  onAuthStateChange:fn=>{callback=fn;},getSession:async()=>({data:{session:null}}),getUser:async()=>{calls.push(['getUser']);return {data:{user},error:user?null:{code:'session_missing'}};},
  signUp:async args=>{calls.push(['signup',args]);return {data:{user:null},error:null};},
  signInWithPassword:async args=>{calls.push(['login',args]);user={id:'own-user',email:'own@example.invalid',email_confirmed_at:'2026-10-07T00:00:00Z',phone:''};profile={id:user.id,full_name:'Nome <teste>',phone:null,marketing_email:false,marketing_whatsapp:false,account_consent_version:config.privacyVersion};callback('SIGNED_IN');return {data:{user},error:null};},
  signOut:async args=>{calls.push(['logout',args]);user=null;profile=null;callback('SIGNED_OUT');return {error:null};},
  resetPasswordForEmail:async()=>({error:null}),updateUser:async args=>{calls.push(['updateUser',args]);return {error:null};},verifyOtp:async()=>({error:null}),resend:async()=>({error:null})
 },from:name=>{assert.equal(name,'chega_profiles');let patch=null;const b={select:()=>b,eq:(key,id)=>{assert.equal(key,'id');assert.equal(id,user?.id);return b;},maybeSingle:async()=>({data:profile,error:null}),update:value=>{patch=value;calls.push(['profile',value]);return b;},single:async()=>{profile={...profile,...patch};return {data:profile,error:null};}};return b;},functions:{invoke:async(name,args)=>{calls.push(['function',name,args]);return {error:null};}}};
 const document={querySelector:get,addEventListener:(name,fn)=>handlers[name]=fn,createElement:()=>new Element(),head:{append(){throw new Error('Unexpected external script');}}};
 class FormData {constructor(form){this.values=form.values;}get(key){return this.values[key]??null;}}
 const window={CHEGA_AUTH_CONFIG:config,supabase:{createClient:(url,key,options)=>{assert.equal(url,config.url);assert.equal(key,config.publishableKey);assert.equal(options.auth.flowType,'implicit');return api;}}};
 const ctx={window,document,location:{hash:'#conta',protocol:'https:',origin:'https://store.example.invalid',pathname:'/'},history:{replaceState(){}},sessionStorage:{getItem:()=>null,setItem(){},removeItem(){}},TextEncoder,FormData,Error,TypeError,Date,Map,Object,String,Boolean,JSON,URL,Blob,setTimeout:fn=>setImmediate(fn)};
 vm.createContext(ctx);vm.runInContext(source,ctx);await window.ChegaAuth.ready;
 const auth=window.ChegaAuth,flush=async()=>{await new Promise(setImmediate);await new Promise(setImmediate);};
 const click=(selector,dataset)=>handlers.click({target:{closest:s=>s===selector?{dataset}:null}});
 const submit=async(type,values)=>{const form=new Element();form.dataset.authForm=type;form.values=values;form.reportValidity=()=>true;handlers.submit({target:{closest:()=>form},preventDefault(){}});await flush();};
 assert.equal(auth.normalizePhone(''),null);assert.equal(auth.normalizePhone('(81) 99688-1704'),'+5581996881704');assert.equal(auth.normalizePhone('+55 81 99688 1704'),'+5581996881704');assert.throws(()=>auth.normalizePhone('1234'));assert.throws(()=>auth.validatePassword('short'));assert.equal(auth.validatePassword('uma frase longa aqui'),'uma frase longa aqui');assert.throws(()=>auth.validatePassword('é'.repeat(40)));
 assert.equal(auth.errorMessage({status:429}),'Muitas tentativas em pouco tempo. Aguarde alguns minutos antes de tentar novamente.');
 click('[data-auth-tab]',{authTab:'cadastro'});assert(get('#main').innerHTML.includes('<fieldset disabled'));assert(!get('#main').innerHTML.includes('name="account-cpf"'));
 await submit('register',{});assert(!calls.some(c=>c[0]==='signup'));
 config.publicRegistrationEnabled=true;click('[data-auth-tab]',{authTab:'cadastro'});
 const values={'account-name':'Ronaldo Teste','account-email':'test@example.invalid','account-password':'senha longa de teste','account-password-repeat':'senha longa de teste','account-consent':'on','account-phone':''};
 await submit('register',{...values,'account-consent':null});assert(!calls.some(c=>c[0]==='signup'));
 await submit('register',{...values,'marketing-whatsapp':'on'});assert(!calls.some(c=>c[0]==='signup'));
 await submit('register',values);const signup=calls.find(c=>c[0]==='signup')[1];assert.equal(signup.options.data.account_consent,true);assert.equal(signup.options.data.privacy_version,config.privacyVersion);assert.equal(signup.options.data.marketing_email,false);assert.equal(signup.options.data.marketing_whatsapp,false);assert.equal(signup.options.data.phone,null);assert(!('cpf' in signup.options.data));assert.equal(signup.options.emailRedirectTo,'https://store.example.invalid/#conta');
 await submit('login',{'account-email':'own@example.invalid','account-password':'senha longa de teste'});assert(calls.some(c=>c[0]==='getUser'));assert(get('#main').innerHTML.includes('Nome &lt;teste&gt;'));assert(get('#main').innerHTML.includes('E-mail confirmado'));assert(!get('#main').innerHTML.includes('Confirmar meu telefone'));
 await submit('profile',{'profile-name':'Nome editado','profile-phone':'(81) 99688-1704','marketing-email':'on'});const patch=calls.find(c=>c[0]==='profile')[1];assert.deepEqual(Object.keys(patch).sort(),['full_name','marketing_email','marketing_whatsapp','phone']);assert.equal(patch.phone,'+5581996881704');assert(get('#main').innerHTML.includes('ainda sem verificação'));
 await submit('delete',{'delete-password':'senha longa de teste','delete-confirm':'on'});const deletion=calls.find(c=>c[0]==='function');assert.equal(deletion[1],'delete-account');assert.equal(deletion[2].body.confirm,'EXCLUIR');assert(!('user_id' in deletion[2].body));assert(!('id' in deletion[2].body));assert(calls.some(c=>c[0]==='logout'&&c[1].scope==='local'));
 config.captchaSiteKey='configured-fixture';const loginCount=calls.filter(c=>c[0]==='login').length;await submit('login',{'account-email':'own@example.invalid','account-password':'senha longa de teste'});assert.equal(calls.filter(c=>c[0]==='login').length,loginCount);assert(get('#account-status').textContent.includes('verificação de segurança'));
 console.log('PASS: cadastro pausado, validações, consentimentos opcionais, 0 CPF, confirmação, perfil próprio e exclusão sem ID do cliente.');
})().catch(error=>{console.error(error);process.exitCode=1;});
