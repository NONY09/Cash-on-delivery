(function () {
  'use strict';
  const config = window.CHEGA_CONFIG;
  const model = window.ChegaStore;
  const $ = selector => document.querySelector(selector);
  const main = $('#main');
  const cartDialog = $('#cart-dialog');
  const chatPanel = $('#chat-panel');
  const money = cents => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cents / 100);
  const escape = value => String(value).replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));
  const icon = (name, cls = '') => `<svg class="icon ${cls}" aria-hidden="true"><use href="#i-${name}"/></svg>`;
  const wa = message => `https://wa.me/${config.whatsapp}?text=${encodeURIComponent(message)}`;
  let cart = null;
  let currentProduct = null;
  let currentOffer = null;
  let category = 'Todos';
  let query = '';
  let accountTab = 'login';
  let chatReturnFocus = null;
  let pendingReplacement = null;
  let toastTimer;
  try { cart = model.normalize(JSON.parse(localStorage.getItem(config.storageKey))); } catch { /* Cart works without storage. */ }

  function setupLinks() {
    document.querySelectorAll('[data-wa]').forEach(link => {
      link.href = wa(link.dataset.wa);
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
    });
  }
  function announce(message) {
    clearTimeout(toastTimer);
    $('#toast').textContent = message;
    $('#toast').classList.add('visible');
    if (cartDialog.open) {
      $('#cart-status').textContent = '';
      requestAnimationFrame(() => { if (cartDialog.open) $('#cart-status').textContent = message; });
    }
    toastTimer = setTimeout(() => $('#toast').classList.remove('visible'), 4500);
  }
  function saveCart() {
    try {
      if (cart) localStorage.setItem(config.storageKey, JSON.stringify(cart));
      else localStorage.removeItem(config.storageKey);
    } catch { /* Storage denied: retain in memory for this visit. */ }
    const item = model.resolveCart(cart);
    $('#cart-count').textContent = item ? item.offer.quantity : 0;
    $('.cart-trigger').setAttribute('aria-label', item ? `Abrir carrinho, ${item.offer.quantity} unidade${item.offer.quantity > 1 ? 's' : ''}` : 'Abrir carrinho, vazio');
    $('.cart-count').classList.remove('bump');
    requestAnimationFrame(() => $('.cart-count').classList.add('bump'));
  }
  function faqList(items) {
    return items.map(item => `<details class="faq-item"><summary>${escape(item.question)}${icon('chevron')}</summary><p>${escape(item.answer)}</p></details>`).join('');
  }
  function productCard(product) {
    return `<article class="product-card">
      <a href="#produto/${encodeURIComponent(product.id)}" class="product-card-image"><img src="${escape(product.image)}" alt="${escape(product.imageAlt)}" loading="lazy" width="1000" height="1000"><span class="tag">${product.demo ? 'Produto de exemplo' : 'Pague na entrega'}</span><span class="image-open">Ver produto ${icon('arrow')}</span></a>
      <div class="product-card-body"><div><span class="category-label">${escape(product.category)}</span><h3><a href="#produto/${encodeURIComponent(product.id)}">${escape(product.name)}</a></h3><p>${escape(product.summary)}</p></div><div class="card-price"><span>${money(product.offers[0].priceCents)}</span><small>${product.demo ? 'Preço ilustrativo' : 'Pagamento na entrega'}</small></div></div>
    </article>`;
  }
  function catalogHTML() {
    const normalized = value => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    const products = config.products.filter(product => (category === 'Todos' || product.category === category) && normalized(`${product.name} ${product.category} ${product.summary}`).includes(normalized(query)));
    return products.length ? products.map(productCard).join('') : `<div class="catalog-empty">${icon('search')}<h3>Nenhum produto por aqui ainda.</h3><p>${query ? `Não encontramos “${escape(query)}”. Tente outra palavra ou veja todo o catálogo.` : 'Essa categoria está reservada para os próximos produtos.'}</p><button class="text-button" data-action="reset-filters" type="button">Ver todos os produtos ${icon('arrow')}</button></div>`;
  }
  function home() {
    document.title = 'Chega — gostou, chegou, pagou.';
    currentProduct = null;
    const product = config.products[0];
    main.innerHTML = `<section class="hero container">
      <div class="hero-copy"><h1>Gostou.<br>Chegou.<br><span>Pagou.</span></h1><p>Encontre algo para o seu dia.<br>O pagamento? Só quando o produto<br class="desktop-break"> chegar na sua casa.</p><div class="hero-actions"><a class="button primary" href="#catalogo">Explorar a loja ${icon('arrow')}</a><a class="hero-secondary" href="#como-funciona">Entenda como funciona</a></div><div class="hero-note">${icon('check')}Sem pagamento antecipado</div></div>
      <div class="hero-visual"><a href="#produto/${encodeURIComponent(product.id)}" class="hero-photo" aria-label="Conhecer o produto de exemplo"><img src="${escape(product.image)}" alt="${escape(product.imageAlt)}" fetchpriority="high" width="1000" height="1000"><span class="hero-image-caption">Uma ideia para sua rotina.</span></a><div class="delivery-slip">${icon('box')}<div><strong>Primeiro, chega.</strong><span>Depois, você paga na entrega.</span></div>${icon('check','slip-check')}</div><span class="image-disclaimer">Imagem conceitual · produto de demonstração</span></div>
    </section>
    <div class="service-line"><div class="container"><span>${icon('truck')}Disponibilidade conforme seu CEP</span><span>${icon('bag')}Um produto por pedido</span><a href="#ajuda">${icon('chat')}Atendimento acessível</a></div></div>
    <section class="catalog-section container" id="catalogo"><div class="section-heading"><div><h2>Seu próximo achado.</h2><p>Escolha com calma. Conheça cada detalhe.</p></div><span class="catalog-status">Catálogo em preparação</span></div><div class="catalog-tools"><div class="category-tabs" role="group" aria-label="Filtrar produtos por categoria">${['Todos','Autocuidado','Casa e rotina'].map(name => `<button class="category-tab ${category === name ? 'active' : ''}" type="button" data-category="${escape(name)}" aria-pressed="${category === name}">${escape(name)}</button>`).join('')}</div><span id="search-status" role="status">${query ? `Busca: ${escape(query)}` : 'Uma seleção que vai crescer com você.'}</span></div><div class="catalog-layout"><div class="product-grid" id="product-grid">${catalogHTML()}</div><aside class="next-products"><h3>Espaço para<br>novos favoritos.</h3><p>Autocuidado, casa e soluções para a rotina. Os próximos produtos vão aparecer por aqui.</p><span>Em breve no catálogo</span></aside></div></section>
    <section class="how-section" id="como-funciona"><div class="container how-layout"><div><h2>Você escolhe.<br>A gente explica<br>o caminho.</h2><p>Uma compra simples, com as condições claras antes de pedir.</p><a class="text-button" href="#ajuda">Ainda tem uma dúvida? ${icon('arrow')}</a></div><ol class="how-steps"><li><span class="step-number">1</span><div><h3>Encontre seu produto</h3><p>Veja a descrição e escolha uma das opções disponíveis na oferta.</p></div></li><li><span class="step-number">2</span><div><h3>Confira a entrega</h3><p>No checkout da oferta, consulte seu CEP, a disponibilidade e as condições antes de confirmar.</p></div></li><li><span class="step-number">3</span><div><h3>Receba e pague</h3><p>O pagamento acontece na entrega, pelos meios aceitos na oferta.</p></div></li></ol></div><div class="container how-footnote">Nesta prévia, você pode explorar e testar o carrinho. As compras ainda não estão habilitadas.</div></section>
    <section class="help-section container" id="ajuda"><div class="help-intro"><h2>Perguntas pequenas.<br>Respostas claras.</h2><p>Saiba o que esperar antes de fazer seu pedido.</p><button class="button secondary" data-action="open-chat" type="button">${icon('chat')}Abrir ajuda rápida</button><a class="text-button" data-wa="Olá! Tenho uma dúvida sobre a loja.">Conversar no WhatsApp ${icon('arrow')}</a></div><div class="faq-list">${faqList(config.faq.slice(0,4))}</div></section>`;
    setupLinks();
  }
  function productPage(id) {
    const product = model.findProduct(id);
    if (!product) { main.innerHTML = `<section class="container missing-page"><h1>Esse produto não foi encontrado.</h1><p>Veja os produtos disponíveis no catálogo.</p><a class="button primary" href="#catalogo">Voltar à loja ${icon('arrow')}</a></section>`; return; }
    currentProduct = product;
    currentOffer = product.offers[0].id;
    document.title = `${product.name} — Chega`;
    main.innerHTML = `<section class="product-section container"><nav class="breadcrumbs" aria-label="Caminho da página"><a href="#inicio">Início</a><span>/</span><a href="#catalogo">Produtos</a><span>/</span><span>${escape(product.category)}</span></nav><div class="product-layout"><div class="product-gallery"><img src="${escape(product.image)}" alt="${escape(product.imageAlt)}" width="1000" height="1000"><p>${product.demo ? 'Imagem conceitual para demonstrar o layout.' : 'Confira os detalhes do produto antes de pedir.'}</p></div><div class="product-info"><span class="tag inline-tag">${product.demo ? 'Produto de demonstração' : 'Pagamento na entrega'}</span><h1>${escape(product.name)}</h1><p class="product-summary">${escape(product.summary)}</p><p>${escape(product.description)}</p><div class="product-price"><strong id="offer-price">${money(product.offers[0].priceCents)}</strong><span>${product.demo ? 'Preço ilustrativo · não é uma oferta real' : 'Pague somente na entrega'}</span></div><fieldset class="offer-selector"><legend>Escolha sua opção</legend>${product.offers.map((offer,i) => `<label class="offer-option"><input type="radio" name="offer" value="${escape(offer.id)}" ${i === 0 ? 'checked' : ''}><span><strong>${escape(offer.label)}</strong><small>${money(offer.priceCents)}${product.demo ? ' · exemplo' : ''}</small></span></label>`).join('')}</fieldset><button class="button primary add-cart" type="button" data-action="add-cart">${icon('bag')}${product.demo ? 'Experimentar carrinho' : 'Adicionar ao carrinho'}</button><div class="payment-note">${icon('box')}<div><strong>Pagamento na entrega</strong><span>Disponibilidade e meios de pagamento conforme a oferta.</span></div></div><a class="product-support" data-wa="Olá! Quero saber mais sobre ${escape(product.name)}.">${icon('wa')}Tirar uma dúvida sobre este produto</a></div></div><div class="product-details-grid"><section><h2>Os detalhes fazem diferença.</h2><dl class="spec-list">${product.details.map(([key,value]) => `<div><dt>${escape(key)}</dt><dd>${escape(value)}</dd></div>`).join('')}</dl></section><section><h2>Antes de escolher.</h2><div class="faq-list">${faqList([...product.faq,config.faq[0],config.faq[1]])}</div><button class="text-button" type="button" data-action="open-chat">Mais dúvidas? Abra a ajuda ${icon('arrow')}</button></section></div></section>`;
    setupLinks();
  }
  function renderAccount() {
    currentProduct = null;
    document.title = 'Minha conta — Chega';
    const register = accountTab === 'cadastro';
    const recover = accountTab === 'recuperar';
    main.innerHTML = `<section class="account-section container"><div class="account-intro"><h1>Um espaço<br>para você.</h1><p>Conheça a loja no seu tempo.<br>Para explorar, você não precisa de uma conta.</p><a class="text-button" href="#catalogo">Continuar na loja ${icon('arrow')}</a></div><div class="account-form-area"><div class="account-tabs" role="group" aria-label="Opções da conta"><button type="button" data-account="login" class="${!register ? 'active' : ''}" aria-pressed="${!register}">Entrar</button><button type="button" data-account="cadastro" class="${register ? 'active' : ''}" aria-pressed="${register}">Criar conta</button></div><h2>${recover ? 'Recuperar acesso' : register ? 'Vamos começar?' : 'Bom ter você por aqui.'}</h2><div class="account-notice">${icon('user')}<p>O acesso será liberado em breve. Esta tela é uma prévia e não envia nem salva seus dados.</p></div><form id="account-form"><fieldset disabled aria-describedby="account-status">${register ? '<label for="account-name">Seu nome</label><input id="account-name" type="text" placeholder="Como podemos chamar você?" autocomplete="off">' : ''}<label for="account-email">E-mail</label><input id="account-email" type="email" placeholder="voce@exemplo.com" autocomplete="off">${!recover ? '<label for="account-password">Senha</label><input id="account-password" type="password" placeholder="Digite sua senha" autocomplete="off">' : ''}${register ? '<label for="account-password-repeat">Confirme a senha</label><input id="account-password-repeat" type="password" placeholder="Digite novamente" autocomplete="off"><label class="checkbox-label"><input type="checkbox"><span>Li as condições de compra e a política de privacidade.</span></label><label class="checkbox-label"><input type="checkbox"><span>Quero receber novidades e ofertas (opcional).</span></label>' : ''}<button type="submit" class="button primary">${recover ? 'Enviar link de recuperação' : register ? 'Criar minha conta' : 'Entrar na minha conta'}</button></fieldset><p id="account-status" class="form-status">Cadastro e autenticação ainda não habilitados.</p></form>${!register ? `<button type="button" class="text-button" data-account="${recover ? 'login' : 'recuperar'}">${recover ? 'Voltar para entrar' : 'Esqueci minha senha'}</button>` : ''}<div class="account-legal"><a href="#termos">Condições de compra</a><a href="#privacidade">Política de privacidade</a></div></div></section>`;
  }
  const legalPages = {
    privacidade: { title: 'Sua privacidade, com clareza.', intro: 'Informações sobre esta prévia da loja.', content: `<h2>O que esta versão utiliza</h2><p>O carrinho pode guardar no seu navegador apenas o código do produto e a opção escolhida. Nenhum nome, e-mail, endereço ou senha é salvo por esta prévia. Você pode remover esses dados usando o botão abaixo ou limpando os dados do site no navegador.</p><button class="button secondary" type="button" data-action="clear-local">Limpar o carrinho deste navegador</button><h2>Atendimento no WhatsApp</h2><p>Ao abrir o WhatsApp, você utiliza um serviço externo. Os dados que escolher compartilhar na conversa serão tratados nesse serviço e pelo atendimento.</p><h2>Antes da abertura da loja</h2><p>A política definitiva deverá identificar o responsável e detalhar o tratamento de dados de cadastro e pedidos, os serviços envolvidos, as finalidades, a conservação e os canais para solicitações. Esses dados ainda não foram cadastrados.</p><h2>Preferências e publicidade</h2><p>Esta prévia não integra anúncios, pixels de marketing, análise de visitas ou cadastro de novidades. As preferências necessárias serão implementadas quando essas funcionalidades forem definidas.</p>` },
    termos: { title: 'Condições claras antes de pedir.', intro: 'A loja está em preparação. Esta página descreve o fluxo previsto, sem habilitar vendas.', content: `<h2>Um produto por pedido</h2><p>Cada carrinho contém apenas um tipo de produto, na quantidade definida pela opção escolhida. A inclusão de outro produto requer substituir o item atual.</p><h2>Pagamento na entrega</h2><p>O fluxo previsto é pagamento ao receber o produto. Disponibilidade por CEP, valor final, possíveis custos de entrega, prazo, meios de pagamento e responsável pela oferta deverão aparecer no checkout real antes da confirmação. A prévia não confirma nenhuma dessas condições.</p><h2>Ofertas de parceiros</h2><p>Quando as vendas forem habilitadas, o pedido poderá seguir pelo link da oferta de um parceiro. A página de cada produto deverá informar quem vende, entrega e atende o pedido, além da relação comercial com a loja.</p><h2>Produto de demonstração</h2><p>A imagem, o preço, as quantidades e os textos do exemplo servem apenas para avaliar o layout. Não representam estoque ou uma oferta disponível.</p><h2>Identificação da loja</h2><p>O nome comercial definitivo, a identificação e o contato do responsável, assim como as condições completas de compra, ainda serão cadastrados antes da abertura das vendas.</p>` },
    trocas: { title: 'Ajuda também depois da entrega.', intro: 'O canal de atendimento já está disponível. As condições definitivas serão publicadas com as ofertas reais.', content: `<h2>Fale com o atendimento</h2><p>Use o WhatsApp para tirar dúvidas ou solicitar orientações sobre um produto. Evite enviar senhas ou dados de cartão.</p><a class="button primary" data-wa="Olá! Preciso de ajuda sobre troca, devolução ou atendimento.">Abrir WhatsApp ${icon('wa')}</a><h2>Quando os pedidos estiverem ativos</h2><p>O atendimento deverá identificar o pedido e orientar o procedimento, o responsável e os prazos aplicáveis. A política definitiva de trocas, devoluções e cancelamentos será revisada e publicada antes das vendas.</p><h2>Nesta prévia</h2><p>Nenhum pedido é enviado, nenhuma cobrança é realizada e nenhum prazo de entrega é prometido.</p>` }
  };
  function renderLegal(key) {
    currentProduct = null;
    const page = legalPages[key];
    document.title = `${key === 'privacidade' ? 'Privacidade' : key === 'termos' ? 'Condições de compra' : 'Atendimento'} — Chega`;
    main.innerHTML = `<article class="legal-page container"><a href="#inicio" class="text-button">Voltar à loja ${icon('arrow')}</a><h1>${page.title}</h1><p class="legal-intro">${page.intro}</p><div class="legal-status">Documento inicial · informações da operação ainda pendentes.</div><div class="legal-content">${page.content}</div></article>`;
    setupLinks();
  }
  function renderCart() {
    const item = model.resolveCart(cart);
    const target = $('#cart-content');
    if (pendingReplacement) {
      const next = model.resolveCart(pendingReplacement);
      target.innerHTML = `<div class="replacement"><h3>Trocar o produto do carrinho?</h3><p>Cada pedido contém um tipo de produto. Para adicionar ${escape(next.product.name)}, retire o produto atual.</p><button class="button primary" type="button" data-action="replace-cart">Substituir produto</button><button class="button secondary" type="button" data-action="cancel-replace">Manter meu produto</button></div>`;
      return;
    }
    if (!item) {
      target.innerHTML = `<div class="empty-cart">${icon('bag')}<h3>Seu próximo achado<br>ainda não está aqui.</h3><p>Explore a loja e escolha um produto para experimentar o carrinho.</p><button class="button primary" data-action="shop-from-cart" type="button">Explorar produtos ${icon('arrow')}</button></div>`;
      return;
    }
    const { product, offer } = item;
    const checkoutUrl = model.checkout(item);
    target.innerHTML = `<div class="cart-item"><img src="${escape(product.image)}" alt="${escape(product.imageAlt)}" width="100" height="100"><div><span class="category-label">${product.demo ? 'Exemplo de produto' : escape(product.category)}</span><h3>${escape(product.name)}</h3><strong>${money(offer.priceCents)}</strong><button class="remove-item" type="button" data-action="remove-cart">Remover produto</button></div></div><div class="cart-offer"><label for="cart-offer">Opção do pedido</label><select id="cart-offer">${product.offers.map(option => `<option value="${escape(option.id)}" ${offer.id === option.id ? 'selected' : ''}>${escape(option.label)} — ${money(option.priceCents)}</option>`).join('')}</select><p>As quantidades são definidas por cada oferta.</p></div><div class="cart-summary"><div><span>Total ${product.demo ? 'ilustrativo' : 'dos produtos'}</span><strong>${money(offer.priceCents)}</strong></div><p>Entrega e disponibilidade serão conferidas no checkout da oferta.</p></div><div class="payment-note">${icon('box')}<div><strong>Você paga na entrega.</strong><span>Nenhum pagamento antecipado pela loja.</span></div></div>${checkoutUrl ? `<a class="button primary checkout-button" href="${escape(checkoutUrl)}" target="_blank" rel="noopener noreferrer">Conferir entrega e pedir ${icon('arrow')}</a><p class="checkout-info">Você seguirá para o checkout do parceiro desta oferta, mantendo o link de afiliação.</p>` : `<button class="button primary checkout-button" type="button" disabled>Compra disponível em breve</button><p class="checkout-info">Carrinho de demonstração. Nenhum pedido será enviado.</p>`}<a class="cart-help" data-wa="Olá! Quero tirar uma dúvida sobre ${escape(product.name)} e o pagamento na entrega.">${icon('wa')}Precisa de ajuda com este produto?</a><a class="cart-terms" href="#termos" data-action="close-cart">Consultar condições de compra</a>`;
    setupLinks();
  }
  function closeChat(restore = true) {
    chatPanel.hidden = true;
    if (restore && chatReturnFocus?.isConnected) chatReturnFocus.focus();
  }
  function openCart() {
    closeChat(false);
    renderCart();
    cartDialog.showModal();
    document.body.classList.add('dialog-open');
  }
  function closeCart() {
    cartDialog.close();
    pendingReplacement = null;
    document.body.classList.remove('dialog-open');
  }
  function addCart() {
    if (!currentProduct) return;
    const result = model.select(cart, currentProduct.id, currentOffer);
    if (result.status === 'invalid') { announce('Essa opção não está disponível. Escolha outra opção.'); return; }
    if (result.status === 'replace-required') { pendingReplacement = result.next; openCart(); return; }
    cart = result.cart;
    saveCart();
    openCart();
    announce('Produto adicionado ao carrinho.');
  }
  function openChat() {
    chatReturnFocus = document.activeElement;
    const questions = [...(currentProduct?.faq || []),...config.faq];
    $('#chat-messages').innerHTML = '<p class="chat-answer">Olá! Escolha uma pergunta abaixo. Se precisar, você também pode falar com o atendimento.</p>';
    $('#chat-questions').innerHTML = questions.map((question,i) => `<button type="button" data-question="${i}">${escape(question.question)}${icon('arrow')}</button>`).join('');
    chatPanel._questions = questions;
    chatPanel.hidden = false;
    $('#chat-panel [data-action="close-chat"]').focus();
  }
  function renderRoute() {
    closeChat(false);
    if (cartDialog.open) closeCart();
    const hash = location.hash.slice(1) || 'inicio';
    document.body.classList.toggle('product-route', hash.startsWith('produto/'));
    if (hash.startsWith('produto/')) {
      let id; try { id = decodeURIComponent(hash.slice(8)); } catch { id = ''; }
      productPage(id);
    } else if (hash === 'conta') renderAccount();
    else if (legalPages[hash]) renderLegal(hash);
    else home();
    requestAnimationFrame(() => {
      const section = ['catalogo','como-funciona','ajuda'].includes(hash) ? document.getElementById(hash) : null;
      if (section) section.scrollIntoView({ block: 'start' });
      else window.scrollTo(0,0);
      if (!section) main.focus({ preventScroll: true });
    });
  }
  document.addEventListener('click', event => {
    if (event.target.closest('.skip-link')) {
      event.preventDefault();
      main.focus({ preventScroll: true });
      main.scrollIntoView({ block: 'start' });
      return;
    }
    const button = event.target.closest('[data-action]');
    if (button) {
      switch (button.dataset.action) {
        case 'open-cart': openCart(); break;
        case 'close-cart': closeCart(); break;
        case 'add-cart': addCart(); break;
        case 'remove-cart': cart = null; saveCart(); renderCart(); $('#cart-content button').focus(); announce('Produto removido do carrinho.'); break;
        case 'replace-cart': cart = pendingReplacement; pendingReplacement = null; saveCart(); renderCart(); $('#cart-offer').focus(); announce('Produto substituído.'); break;
        case 'cancel-replace': pendingReplacement = null; renderCart(); $('#cart-offer').focus(); break;
        case 'shop-from-cart': closeCart(); location.hash = 'catalogo'; break;
        case 'open-chat': openChat(); break;
        case 'close-chat': closeChat(); break;
        case 'clear-local': cart = null; saveCart(); announce('Carrinho e dados locais da prévia removidos.'); break;
        case 'reset-filters': query = ''; category = 'Todos'; $('#search-input').value = ''; home(); $('#catalogo').scrollIntoView(); break;
      }
    }
    const categoryButton = event.target.closest('[data-category]');
    if (categoryButton) {
      category = categoryButton.dataset.category;
      document.querySelectorAll('[data-category]').forEach(element => { element.classList.toggle('active',element.dataset.category === category); element.setAttribute('aria-pressed',String(element.dataset.category === category)); });
      $('#product-grid').innerHTML = catalogHTML();
      $('#search-status').textContent = `${category === 'Todos' ? 'Todos os produtos' : category}${query ? ` · Busca: ${query}` : ''}`;
    }
    const accountButton = event.target.closest('[data-account]');
    if (accountButton) { accountTab = accountButton.dataset.account; renderAccount(); $('#main h2').setAttribute('tabindex','-1'); $('#main h2').focus({preventScroll:true}); }
    const questionButton = event.target.closest('[data-question]');
    if (questionButton) {
      const question = chatPanel._questions[Number(questionButton.dataset.question)];
      const messages = $('#chat-messages');
      // Keep the conversation bounded and expose the newest answer to screen readers.
      if (messages.children.length > 8) messages.firstElementChild.remove();
      const prompt = document.createElement('p'); prompt.className = 'chat-prompt'; prompt.textContent = question.question;
      const answer = document.createElement('p'); answer.className = 'chat-answer'; answer.textContent = question.answer;
      messages.append(prompt,answer); messages.scrollTop = messages.scrollHeight;
    }
  });
  document.addEventListener('change', event => {
    if (event.target.name === 'offer' && currentProduct) {
      currentOffer = event.target.value;
      const offer = currentProduct.offers.find(option => option.id === currentOffer);
      $('#offer-price').textContent = money(offer.priceCents);
    }
    if (event.target.id === 'cart-offer') {
      cart = model.select(cart,cart.productId,event.target.value).cart;
      saveCart(); renderCart(); $('#cart-offer').focus();
    }
  });
  $('#search-form').addEventListener('submit',event => {
    event.preventDefault(); query = $('#search-input').value.trim(); category = 'Todos';
    if (location.hash === '#catalogo') { home(); $('#catalogo').scrollIntoView(); }
    else location.hash = 'catalogo';
  });
  document.addEventListener('submit',event => { if (event.target.id === 'account-form') event.preventDefault(); });
  cartDialog.addEventListener('click',event => { if (event.target === cartDialog) { const bounds = cartDialog.getBoundingClientRect(); if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) closeCart(); } });
  cartDialog.addEventListener('close',() => { document.body.classList.remove('dialog-open'); pendingReplacement = null; });
  document.addEventListener('keydown',event => { if (event.key === 'Escape' && !chatPanel.hidden) closeChat(); });
  window.addEventListener('hashchange',renderRoute);
  window.addEventListener('storage',event => { if (event.key === config.storageKey || event.key === null) { try { cart = model.normalize(JSON.parse(localStorage.getItem(config.storageKey))); } catch { cart = null; } saveCart(); if (cartDialog.open) renderCart(); } });
  $('#year').textContent = new Date().getFullYear();
  setupLinks(); saveCart(); renderRoute();
})();
