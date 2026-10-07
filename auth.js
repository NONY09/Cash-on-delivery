/* Supabase Auth oficial. Apenas a chave publicável é usada no navegador. */
(function () {
  'use strict';
  const config = window.CHEGA_AUTH_CONFIG;
  const $ = selector => document.querySelector(selector);
  const escape = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  class UserInputError extends Error {}
  const state = { user: null, profile: null, tab: 'login', ready: false, notice: '', busy: false, pendingEmail: '', emailNextAt: 0 };
  let client = null;
  let refreshing = null;
  let generation = 0;
  let captchaLoader = null;
  let captchaWidget = null;
  let captchaToken = '';
  function captchaHTML() { return config.captchaSiteKey ? '<div id="auth-captcha" class="account-captcha" aria-label="Verificação de segurança"></div>' : ''; }
  async function mountCaptcha() {
    const container = $('#auth-captcha');
    if (!config.captchaSiteKey || !container) return;
    const details = container.closest('details');
    if (details && !details.open) { details.addEventListener('toggle', () => { if (details.open) void mountCaptcha(); }, {once:true}); return; }
    try {
      if (!window.turnstile) {
        if (!captchaLoader) captchaLoader = new Promise((resolve,reject) => { const script=document.createElement('script'); script.src='https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'; script.async=true; script.onload=resolve; script.onerror=reject; document.head.append(script); });
        await captchaLoader;
      }
      if (!container.isConnected || captchaWidget !== null) return;
      captchaWidget=window.turnstile.render(container,{sitekey:config.captchaSiteKey,size:'flexible',callback:token=>{captchaToken=token;},'expired-callback':()=>{captchaToken='';},'error-callback':()=>{captchaToken='';status('Não foi possível carregar a verificação. Atualize a página e tente novamente.');}});
    } catch { status('Não foi possível carregar a verificação. Atualize a página e tente novamente.'); }
  }
  function requireCaptcha() { if(config.captchaSiteKey && !captchaToken) throw new UserInputError('Aguarde a verificação de segurança antes de continuar.'); return captchaToken || undefined; }
  function resetCaptcha() { captchaToken=''; if(captchaWidget !== null && window.turnstile) window.turnstile.reset(captchaWidget); }
  const memory = new Map();
  const storage = {
    getItem(key) { try { return sessionStorage.getItem(key); } catch { return memory.get(key) || null; } },
    setItem(key, value) { try { sessionStorage.setItem(key, value); } catch { memory.set(key, value); } },
    removeItem(key) { try { sessionStorage.removeItem(key); } catch { /* memory fallback */ } memory.delete(key); }
  };
  function normalizePhone(value) {
    let digits = String(value || '').replace(/\D/g, '');
    if (!digits) return null;
    if ((digits.length === 12 || digits.length === 13) && digits.startsWith('55')) digits = digits.slice(2);
    if (!/^[1-9]\d{9,10}$/.test(digits)) throw new UserInputError('Informe um telefone brasileiro com DDD ou deixe o campo vazio.');
    return '+55' + digits;
  }
  function validatePassword(value) {
    if (value.length < 12 || value.length > 64 || new TextEncoder().encode(value).length > 72) throw new UserInputError('Use uma senha de 12 a 64 caracteres, sem ultrapassar 72 bytes. Prefira uma frase longa.');
    return value;
  }
  function errorMessage(error) {
    if (error?.status === 429 || /rate_limit|too_many/.test(error?.code || '')) return 'Muitas tentativas em pouco tempo. Aguarde alguns minutos antes de tentar novamente.';
    if (error?.code === 'invalid_credentials') return 'Confira seu e-mail e sua senha e tente novamente.';
    if (error?.code === 'email_not_confirmed') return 'Confirme o e-mail da sua conta antes de entrar.';
    if (/otp_expired|otp_disabled|flow_state/.test(error?.code || '')) return 'Esse link ou código não pode mais ser usado. Solicite um novo.';
    if (/weak_password|same_password/.test(error?.code || '')) return 'Escolha uma senha longa e diferente da senha anterior.';
    if (/captcha/.test(error?.code || '')) return 'Não foi possível confirmar a verificação. Tente novamente.';
    if (error instanceof TypeError) return 'Confira sua conexão e tente novamente.';
    return 'Não foi possível concluir agora. Tente novamente mais tarde ou fale com o atendimento.';
  }
  const fromEmailLink = /(?:access_token|error_description|error_code)=/.test(location.hash);
  const accountRoute = () => location.hash === '#conta';
  function status(message) {
    state.notice = message;
    const element = $('#account-status');
    if (element) element.textContent = message;
  }
  function rerender() { if (accountRoute()) renderAccount(); }
  async function refresh() {
    if (!client) return;
    if (refreshing) return refreshing;
    const version = generation;
    refreshing = (async () => {
      const { data: { user }, error } = await client.auth.getUser();
      if (version !== generation) return;
      if (error || !user?.email_confirmed_at) { state.user = null; state.profile = null; return; }
      const { data, error: profileError } = await client.from('chega_profiles').select('*').eq('id', user.id).maybeSingle();
      if (version !== generation) return;
      state.user = user;
      state.profile = profileError ? null : data;
      if (profileError || !data) state.notice = 'Não foi possível carregar seu perfil. Tente novamente ou entre novamente na conta.';
    })().finally(() => { refreshing = null; });
    return refreshing;
  }
  function redirectURL() {
    if (location.protocol !== 'https:') throw new UserInputError('Abra a loja pelo endereço publicado para receber o link de confirmação.');
    return location.origin + location.pathname + '#conta';
  }
  function labelInput(id, label, type, attrs = '', value = '') {
    return `<label for="${id}">${label}</label><input id="${id}" name="${id}" type="${type}" ${attrs} value="${escape(value)}">`;
  }
  function preferenceChecks(profile = {}) {
    return `<label class="checkbox-label"><input type="checkbox" name="marketing-email" ${profile.marketing_email ? 'checked' : ''}><span>Quero receber ofertas por e-mail (opcional).</span></label><label class="checkbox-label"><input type="checkbox" name="marketing-whatsapp" ${profile.marketing_whatsapp ? 'checked' : ''}><span>Quero receber ofertas pelo WhatsApp informado (opcional).</span></label>`;
  }
  function guestHTML() {
    const register = state.tab === 'cadastro', recover = state.tab === 'recuperar', reset = state.tab === 'nova-senha';
    const paused = (register || recover) && !config.publicRegistrationEnabled;
    const title = reset ? 'Escolha sua nova senha.' : recover ? 'Recupere seu acesso.' : register ? 'Sua conta, no seu tempo.' : 'Bom ter você por aqui.';
    const fields = reset ? labelInput('account-password','Nova senha','password','required minlength="12" maxlength="64" autocomplete="new-password"') + labelInput('account-password-repeat','Confirme a nova senha','password','required maxlength="64" autocomplete="new-password"') :
      (register ? labelInput('account-name','Nome completo','text','required minlength="2" maxlength="120" autocomplete="name"') + labelInput('account-phone','Telefone com DDD (opcional)','tel','maxlength="20" autocomplete="tel" inputmode="tel" placeholder="(81) 99999-9999"') + '<p class="field-help">Use para contato se desejar. CPF e endereço são solicitados no checkout do pedido.</p>' : '') +
      labelInput('account-email','E-mail','email','required maxlength="254" autocomplete="username"',state.pendingEmail) + (!recover ? labelInput('account-password','Senha','password',register ? 'required minlength="12" maxlength="64" autocomplete="new-password"' : 'required maxlength="128" autocomplete="current-password"') : '') +
      (register ? labelInput('account-password-repeat','Confirme a senha','password','required maxlength="64" autocomplete="new-password"') + '<p class="field-help">Use uma senha longa, com pelo menos 12 caracteres.</p><label class="checkbox-label account-consent"><input name="account-consent" type="checkbox" required><span>Autorizo o uso do meu nome, e-mail e telefone, se informado, para criar e manter minha conta, conforme a <a href="#privacidade">Política de Privacidade</a>. Posso excluir a conta a qualquer momento.</span></label>' + preferenceChecks() : '');
    return `<h2>${title}</h2>${paused ? `<p class="account-notice">${escape(config.signupPauseMessage)}</p>` : ''}<form id="account-form" data-auth-form="${reset ? 'reset' : recover ? 'recover' : register ? 'register' : 'login'}"><fieldset ${paused || !client || !state.ready ? 'disabled' : ''} aria-describedby="account-status">${fields}${reset ? '' : captchaHTML()}<button class="button primary" type="submit">${reset ? 'Salvar nova senha' : recover ? 'Receber link de recuperação' : register ? 'Criar conta e confirmar e-mail' : 'Entrar na minha conta'}</button></fieldset></form>${register ? '<p class="account-flow-note">O e-mail precisa ser confirmado antes de entrar. Autorizações de ofertas são opcionais e podem ser alteradas na conta.</p>' : !reset ? `<button class="text-button" type="button" data-auth-tab="${recover ? 'login' : 'recuperar'}">${recover ? 'Voltar para entrar' : 'Esqueci minha senha'}</button>` : ''}${state.pendingEmail && config.publicRegistrationEnabled && !reset ? '<button class="text-button" type="button" data-auth-action="resend">Reenviar confirmação do e-mail</button>' : ''}`;
  }
  function signedHTML() {
    if (!state.profile) return '<h2>Sua conta.</h2><p class="account-notice">Não conseguimos carregar seus dados agora.</p><button class="button secondary" type="button" data-auth-action="refresh">Tentar novamente</button><button class="text-button" type="button" data-auth-action="logout">Sair da conta</button>';
    const p = state.profile;
    const verifiedPhone = Boolean(p.phone && state.user.phone_confirmed_at && state.user.phone && '+' + state.user.phone.replace(/\D/g,'') === p.phone);
    return `<h2>Seus dados e preferências.</h2><div class="account-identity"><p>${escape(state.user.email)}</p><span>${iconCheck()}E-mail confirmado</span></div><form data-auth-form="profile"><fieldset><div class="account-fields">${labelInput('profile-name','Nome completo','text','required minlength="2" maxlength="120" autocomplete="name"',p.full_name)}${labelInput('profile-phone','Telefone com DDD (opcional)','tel','maxlength="20" autocomplete="tel" inputmode="tel"',p.phone || '')}</div><p class="field-help">${p.phone ? verifiedPhone ? 'Telefone confirmado.' : 'Telefone informado, ainda sem verificação.' : 'Você pode usar sua conta sem informar telefone.'}</p><div class="account-preferences"><h3>Como podemos falar com você?</h3><p>Essas autorizações são opcionais. Desmarque uma opção e salve para revogá-la.</p>${preferenceChecks(p)}</div><button class="button primary" type="submit">Salvar alterações</button></fieldset></form>${config.phoneVerificationEnabled && p.phone && !verifiedPhone ? '<details class="account-phone-verify"><summary>Confirmar meu telefone</summary><button class="button secondary" type="button" data-auth-action="send-phone">Receber código por SMS</button><form data-auth-form="phone"><label for="phone-code">Código recebido</label><input id="phone-code" name="phone-code" inputmode="numeric" autocomplete="one-time-code" pattern="[0-9]{6}" maxlength="6" required><button class="button secondary" type="submit">Confirmar código</button></form></details>' : ''}<div class="account-tools"><button class="text-button" type="button" data-auth-action="export">Baixar meus dados</button><button class="text-button" type="button" data-auth-action="logout">Sair da conta</button></div><details class="account-delete"><summary>Excluir minha conta</summary><p>A exclusão remove a conta, o perfil e as preferências da loja. Pedidos feitos na Logzz são administrados naquele serviço.</p><form data-auth-form="delete"><label for="delete-password">Confirme sua senha atual</label><input id="delete-password" name="delete-password" type="password" autocomplete="current-password" maxlength="128" required><label class="checkbox-label"><input name="delete-confirm" type="checkbox" required><span>Entendo que a exclusão da minha conta é definitiva.</span></label>${captchaHTML()}<button class="button secondary" type="submit">Confirmar exclusão da conta</button></form></details>`;
  }
  function iconCheck() { return '<svg class="icon small" aria-hidden="true"><use href="#i-check"/></svg>'; }
  function renderAccount() {
    if(captchaWidget !== null && window.turnstile) window.turnstile.remove(captchaWidget);
    captchaWidget=null; captchaToken='';
    document.title = 'Minha conta — Chega';
    const content = !state.ready ? '<h2>Carregando sua conta…</h2><p>Aguarde um instante.</p>' : state.user && state.tab !== 'nova-senha' ? signedHTML() : guestHTML();
    $('#main').innerHTML = `<section class="account-section container"><div class="account-intro"><h1>Um espaço<br>para você.</h1><p>Explore e faça seus pedidos sem cadastro.<br>Sua conta é uma opção para guardar seus dados e preferências.</p><a class="text-button" href="#catalogo">Continuar na loja <svg class="icon" aria-hidden="true"><use href="#i-arrow"/></svg></a></div><div class="account-form-area">${!state.user && state.tab !== 'nova-senha' ? `<div class="account-tabs" role="group" aria-label="Opções da conta"><button type="button" data-auth-tab="login" aria-pressed="${state.tab === 'login'}" class="${state.tab === 'login' ? 'active' : ''}">Entrar</button><button type="button" data-auth-tab="cadastro" aria-pressed="${state.tab === 'cadastro'}" class="${state.tab === 'cadastro' ? 'active' : ''}">Criar conta</button></div>` : ''}${content}<p id="account-status" class="form-status" role="status" aria-live="polite">${escape(state.notice)}</p><div class="account-legal"><a href="#termos">Condições de compra</a><a href="#privacidade">Política de privacidade</a></div></div></section>`;
    void mountCaptcha();
  }
  function setBusy(form, busy) {
    form.setAttribute('aria-busy', String(busy));
    form.querySelectorAll('button[type="submit"]').forEach(button => { button.disabled = busy; });
  }
  function mailCooldown() {
    if (Date.now() < state.emailNextAt) throw new UserInputError('Aguarde um minuto antes de solicitar outro e-mail.');
    state.emailNextAt = Date.now() + 60000;
  }
  async function submit(form) {
    if (!client || state.busy || !form.reportValidity()) return;
    const action = form.dataset.authForm;
    if ((action === 'register' || action === 'recover') && !config.publicRegistrationEnabled) { status(config.signupPauseMessage); return; }
    state.busy = true; setBusy(form,true); status('Aguarde…');
    const values = new FormData(form);
    try {
      if (action === 'register') {
        const name = String(values.get('account-name') || '').trim();
        if (name.length < 2 || name.length > 120) throw new UserInputError('Confira seu nome completo.');
        const phone = normalizePhone(values.get('account-phone'));
        const password = validatePassword(String(values.get('account-password') || ''));
        if (password !== values.get('account-password-repeat')) throw new UserInputError('As senhas precisam ser iguais.');
        if (!values.get('account-consent')) throw new UserInputError('Leia e marque a autorização para criar sua conta.');
        if (values.get('marketing-whatsapp') && !phone) throw new UserInputError('Informe seu telefone para autorizar ofertas por WhatsApp.');
        const email = String(values.get('account-email') || '').trim();
        const callback = redirectURL(); mailCooldown();
        const { error } = await client.auth.signUp({ email, password, options: { emailRedirectTo: callback, captchaToken: requireCaptcha(), data: { full_name: name, phone, account_consent: true, privacy_version: config.privacyVersion, marketing_email: Boolean(values.get('marketing-email')), marketing_whatsapp: Boolean(values.get('marketing-whatsapp')) } } });
        if (error) throw error;
        state.pendingEmail = email; state.tab = 'login';
        status('Se o cadastro puder ser concluído, você receberá um e-mail de confirmação. Confira também a pasta de spam.'); rerender();
      } else if (action === 'login') {
        const { error } = await client.auth.signInWithPassword({ email: String(values.get('account-email')).trim(), password: String(values.get('account-password')), options: { captchaToken: requireCaptcha() } });
        if (error) throw error;
        state.notice = ''; await refresh(); rerender();
      } else if (action === 'recover') {
        const callback = redirectURL(); mailCooldown();
        const { error } = await client.auth.resetPasswordForEmail(String(values.get('account-email')).trim(), { redirectTo: callback, captchaToken: requireCaptcha() });
        if (error) throw error;
        status('Se houver uma conta para esse e-mail, você receberá um link para criar uma nova senha.');
      } else if (action === 'reset') {
        const password = validatePassword(String(values.get('account-password')));
        if (password !== values.get('account-password-repeat')) throw new UserInputError('As senhas precisam ser iguais.');
        const { error } = await client.auth.updateUser({ password }); if (error) throw error;
        state.tab = 'login'; status('Sua senha foi atualizada.'); await refresh(); rerender();
      } else if (action === 'profile') {
        if (!state.user || !state.profile) throw new UserInputError('Entre novamente na sua conta.');
        const phone = normalizePhone(values.get('profile-phone'));
        if (values.get('marketing-whatsapp') && !phone) throw new UserInputError('Informe um telefone ou desmarque a autorização de WhatsApp.');
        const payload = { full_name: String(values.get('profile-name')).trim(), phone, marketing_email: Boolean(values.get('marketing-email')), marketing_whatsapp: Boolean(values.get('marketing-whatsapp')) };
        const { data, error } = await client.from('chega_profiles').update(payload).eq('id',state.user.id).select('*').single();
        if (error) throw error; state.profile = data; status('Seus dados e preferências foram salvos.'); rerender();
      } else if (action === 'phone' && config.phoneVerificationEnabled) {
        const { error } = await client.auth.verifyOtp({ phone: state.profile.phone, token: String(values.get('phone-code')), type: 'phone_change' });
        if (error) throw error; status('Telefone confirmado.'); await refresh(); rerender();
      } else if (action === 'delete') {
        if (!values.get('delete-confirm')) throw new UserInputError('Marque a confirmação de exclusão.');
        const { error } = await client.functions.invoke('delete-account', { body: { password: String(values.get('delete-password')), confirm: 'EXCLUIR', captchaToken: requireCaptcha() } });
        if (error) throw error;
        await client.auth.signOut({ scope: 'local' }); generation++; state.user = null; state.profile = null; state.tab = 'login'; state.pendingEmail = ''; status('Sua conta e seu perfil foram excluídos.'); rerender();
      }
      form.querySelectorAll('input[type="password"]').forEach(input => { input.value = ''; });
    } catch (error) { status(error instanceof UserInputError ? error.message : errorMessage(error)); }
    finally { state.busy = false; setBusy(form,false); resetCaptcha(); }
  }
  async function action(name) {
    if (!client || state.busy) return;
    state.busy = true;
    try {
      if (name === 'logout') { const { error } = await client.auth.signOut({ scope: 'global' }); if (error) throw error; generation++; state.user = null; state.profile = null; state.notice = 'Você saiu da sua conta.'; state.tab = 'login'; rerender(); }
      if (name === 'refresh') { await refresh(); rerender(); }
      if (name === 'resend' && config.publicRegistrationEnabled && state.pendingEmail) { const callback = redirectURL(); mailCooldown(); const { error } = await client.auth.resend({ type: 'signup', email: state.pendingEmail, options: { emailRedirectTo: callback, captchaToken: requireCaptcha() } }); if (error) throw error; status('Se a confirmação estiver pendente, enviaremos um novo e-mail.'); }
      if (name === 'send-phone' && config.phoneVerificationEnabled && state.profile?.phone) { const { error } = await client.auth.updateUser({ phone: state.profile.phone }); if (error) throw error; status('Código enviado. Confira o SMS no telefone informado.'); }
      if (name === 'export' && state.profile && state.user) {
        const data = { email: state.user.email, email_confirmed_at: state.user.email_confirmed_at, profile: state.profile, exported_at: new Date().toISOString() };
        const url = URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json'})); const link = document.createElement('a'); link.href = url; link.download = 'meus-dados-chega.json'; link.click(); setTimeout(() => URL.revokeObjectURL(url),1000); status('Seus dados foram preparados para download.');
      }
    } catch (error) { status(error instanceof UserInputError ? error.message : errorMessage(error)); }
    finally { state.busy = false; if(name === 'resend') resetCaptcha(); }
  }
  document.addEventListener('submit',event => { const form=event.target.closest('[data-auth-form]'); if(form) { event.preventDefault(); void submit(form); } });
  document.addEventListener('click',event => {
    const tab=event.target.closest('[data-auth-tab]');
    if(tab && !state.busy) { state.tab=tab.dataset.authTab; state.notice=''; renderAccount(); const heading=$('#main h2'); heading?.setAttribute('tabindex','-1'); heading?.focus(); }
    const button=event.target.closest('[data-auth-action]'); if(button) void action(button.dataset.authAction);
  });
  const ready = (async () => {
    try {
      if (!window.supabase?.createClient || !config?.url || !config?.publishableKey) throw new UserInputError('Não foi possível carregar o acesso à conta. Atualize a página ou continue explorando a loja.');
      client = window.supabase.createClient(config.url,config.publishableKey,{auth:{storage,storageKey:'chega-auth-v1',persistSession:true,detectSessionInUrl:true,flowType:'implicit'}});
      client.auth.onAuthStateChange((event) => {
        if (event === 'SIGNED_IN') { generation++; state.profile=null; }
        if (event === 'SIGNED_OUT') { generation++; state.user=null; state.profile=null; }
        if (event === 'PASSWORD_RECOVERY') { state.tab='nova-senha'; history.replaceState(null,'',location.pathname+'#conta'); }
        // Never call another Supabase method from inside the SDK auth callback.
        if (['SIGNED_IN','SIGNED_OUT','USER_UPDATED','PASSWORD_RECOVERY'].includes(event)) setTimeout(() => { void refresh().then(rerender); },0);
      });
      const { data: { session } } = await client.auth.getSession();
      if(session) await refresh();
      if (location.hash.includes('access_token=') || location.hash.includes('error_description=')) { state.notice = 'Não foi possível usar esse link. Solicite uma nova confirmação ou recuperação.'; history.replaceState(null,'',location.pathname+'#conta'); }
    } catch { state.notice='Não foi possível carregar o acesso à conta. Atualize a página ou continue explorando a loja.'; }
    finally {
      if(fromEmailLink) {
        history.replaceState(null,'',location.pathname+'#conta');
        if(state.user && !state.notice) state.notice=state.tab === 'nova-senha' ? 'Escolha sua nova senha para concluir a recuperação.' : 'Seu acesso foi confirmado. Bem-vindo à sua conta.';
        else if(!state.user && !state.notice) state.notice='Não foi possível usar esse link. Solicite uma nova confirmação ou recuperação.';
      }
      state.ready=true; rerender();
    }
  })();
  window.ChegaAuth = Object.freeze({ ready, renderAccount, normalizePhone, validatePassword, errorMessage });
})();
