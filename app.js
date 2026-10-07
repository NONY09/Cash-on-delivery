(function () {
  'use strict';
  const config = window.CHEGA_CONFIG;
  const model = window.ChegaStore;
  const $ = selector => document.querySelector(selector);
  const main = $('#main');
  const chatPanel = $('#chat-panel');
  const money = cents => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cents / 100);
  const escape = value => String(value).replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));
  const icon = (name, cls = '') => `<svg class="icon ${cls}" aria-hidden="true"><use href="#i-${name}"/></svg>`;
  const wa = message => `https://wa.me/${config.whatsapp}?text=${encodeURIComponent(message)}`;
  let currentProduct = null;
  let currentOffer = null;
  let galleryIndex = 0;
  let category = 'Todos';
  let query = '';
  let accountTab = 'login';
  let chatReturnFocus = null;
  const catalogPageSize = 12;
  let catalogLimit = catalogPageSize;
  // Remove only the retired cart; no customer data is stored by this catalog.
  try { localStorage.removeItem('chega-cart-v1'); } catch { /* Storage may be unavailable. */ }

  function setupLinks() {
    document.querySelectorAll('[data-wa]').forEach(link => {
      link.href = wa(link.dataset.wa);
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
    });
  }
  function faqList(items) {
    return items.map(item => `<details class="faq-item"><summary>${escape(item.question)}${icon('chevron')}</summary><p>${escape(item.answer)}</p></details>`).join('');
  }
  function galleryHTML(product) {
    const photos = product.images || [{ src: product.image, thumbnail: product.image, alt: product.imageAlt }];
    return `<div class="product-gallery" role="region" aria-label="Fotos de ${escape(product.name)}">
      <div id="gallery-track" class="gallery-track" tabindex="0" aria-label="Galeria de fotos; use as setas do teclado ou deslize no celular">
        ${photos.map((photo, index) => `<figure class="gallery-slide"><img src="${escape(photo.src)}" alt="${escape(photo.alt)}" width="1200" height="1600" ${index ? 'loading="lazy"' : 'fetchpriority="high"'}><figcaption class="sr-only">Foto ${index + 1} de ${photos.length}</figcaption></figure>`).join('')}
      </div>
      <div class="gallery-toolbar"><span>Fotos do produto</span><div><button class="icon-button" id="gallery-prev" data-action="gallery-prev" type="button" aria-label="Foto anterior" aria-controls="gallery-track">${icon('left')}</button><output id="gallery-count" aria-live="polite">1 / ${photos.length}</output><button class="icon-button" id="gallery-next" data-action="gallery-next" type="button" aria-label="Próxima foto" aria-controls="gallery-track">${icon('right')}</button></div></div>
      <div class="gallery-thumbnails" role="group" aria-label="Escolher foto">${photos.map((photo, index) => `<button type="button" data-photo="${index}" aria-label="Ver foto ${index + 1}" aria-pressed="${index === 0}" aria-controls="gallery-track"><img src="${escape(photo.thumbnail || photo.src)}" alt="" width="60" height="76" loading="lazy"></button>`).join('')}<span>Deslize para ver as fotos.<br>Ou escolha uma miniatura.</span></div>
    </div>`;
  }
  function updateGallery(index) {
    const count = currentProduct?.images?.length || 1;
    galleryIndex = Math.max(0, Math.min(count - 1, index));
    $('#gallery-count').textContent = `${galleryIndex + 1} / ${count}`;
    $('#gallery-prev').setAttribute('aria-disabled', String(galleryIndex === 0));
    $('#gallery-next').setAttribute('aria-disabled', String(galleryIndex === count - 1));
    document.querySelectorAll('[data-photo]').forEach(button => button.setAttribute('aria-pressed', String(Number(button.dataset.photo) === galleryIndex)));
  }
  function selectPhoto(index) {
    if (!currentProduct || !Number.isInteger(index)) return;
    const count = currentProduct.images?.length || 1;
    const target = Math.max(0, Math.min(count - 1, index));
    const track = $('#gallery-track');
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    track.scrollTo({ left: target * track.clientWidth, behavior: reduced ? 'auto' : 'smooth' });
    updateGallery(target);
  }
  function videoHTML(product) {
    if (!product.video) return '';
    return `<details class="product-video" id="product-video"><summary><span>${icon('play')}Veja o produto em ação</span><span>Vídeo de demonstração ${icon('chevron')}</span></summary><div class="video-layout"><div class="video-copy"><h2>${escape(product.video.title)}</h2><p>${escape(product.video.description)}</p>${product.video.visualDescription ? `<p class="video-description" id="video-description"><strong>O que aparece no vídeo:</strong> ${escape(product.video.visualDescription)}</p>` : ''}<p class="video-origin">Material fornecido pelo produtor. Não representa uma avaliação verificada pela loja.</p><button class="button secondary" type="button" data-action="back-to-offers">Escolher meu kit ${icon('arrow')}</button></div><div class="video-player"><video id="product-video-player" controls playsinline preload="none" poster="${escape(product.video.poster)}" data-src="${escape(product.video.src)}" aria-label="Demonstração de ${escape(product.name)}" ${product.video.visualDescription ? 'aria-describedby="video-description"' : ''}><p>Seu navegador não suporta este vídeo. Fale com o atendimento para conhecer o produto.</p></video><p id="video-status" role="status"></p><button type="button" class="text-button" data-action="retry-video" id="video-retry" hidden>Tentar carregar o vídeo novamente</button></div></div></details>`;
  }
  function initProductMedia() {
    const track = $('#gallery-track');
    updateGallery(0);
    track.addEventListener('scroll', () => { if (track.clientWidth) updateGallery(Math.round(track.scrollLeft / track.clientWidth)); }, { passive: true });
    track.addEventListener('keydown', event => {
      if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') { event.preventDefault(); selectPhoto(galleryIndex + (event.key === 'ArrowRight' ? 1 : -1)); }
    });
    const details = $('#product-video');
    const player = $('#product-video-player');
    if (!details || !player) return;
    details.addEventListener('toggle', () => {
      if (details.open && !player.getAttribute('src')) { player.src = player.dataset.src; player.load(); }
      if (!details.open) player.pause();
    });
    player.addEventListener('error', () => { $('#video-status').textContent = 'O vídeo não carregou. Tente novamente ou fale com o atendimento.'; $('#video-retry').hidden = false; });
  }
  function productCard(product) {
    return `<article class="product-card">
      <a href="#produto/${encodeURIComponent(product.id)}" class="product-card-image"><img src="${escape(product.image)}" alt="${escape(product.imageAlt)}" loading="lazy" width="1000" height="1000"><span class="tag">${product.demo ? 'Produto de exemplo' : 'Pague na entrega'}</span><span class="image-open">Ver produto ${icon('arrow')}</span></a>
      <div class="product-card-body"><div><span class="category-label">${escape(product.category)}</span><h3><a href="#produto/${encodeURIComponent(product.id)}">${escape(product.name)}</a></h3><p>${escape(product.summary)}</p></div><div class="card-price"><span>${product.offers.length > 1 ? 'A partir de ' : ''}${money(Math.min(...product.offers.map(offer => offer.priceCents)))}</span><small>${product.demo ? 'Preço ilustrativo' : 'Pagamento na entrega'}</small></div><a class="button secondary product-card-cta" href="#produto/${encodeURIComponent(product.id)}" aria-label="Escolher kit de ${escape(product.name)}">Escolher kit ${icon('arrow')}</a></div>
    </article>`;
  }
  function filteredProducts() {
    const normalized = value => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    return config.products.filter(product => (category === 'Todos' || product.category === category) && normalized(`${product.name} ${product.category} ${product.summary}`).includes(normalized(query)));
  }
  function catalogHTML() {
    const products = filteredProducts();
    return products.length ? products.slice(0, catalogLimit).map(productCard).join('') : `<div class="catalog-empty">${icon('search')}<h3>Nenhum produto encontrado.</h3><p>${query ? `Não encontramos “${escape(query)}”. Tente outra palavra ou veja todo o catálogo.` : 'Veja as outras categorias disponíveis.'}</p><button class="text-button" data-action="reset-filters" type="button">Ver todos os produtos ${icon('arrow')}</button></div>`;
  }
  function renderCatalog() {
    const products = filteredProducts();
    $('#product-grid').innerHTML = catalogHTML();
    const count = Math.min(catalogLimit, products.length);
    $('#search-status').textContent = `${count} de ${products.length} produto${products.length === 1 ? '' : 's'}${category !== 'Todos' ? ` · ${category}` : ''}${query ? ` · Busca: ${query}` : ''}`;
    $('#catalog-more').hidden = count >= products.length;
  }
  function purchaseHTML(product, offer) {
    const url = model.checkout(product.id, offer.id);
    return url ? `<a class="button primary order-button" href="${escape(url)}" target="_blank" rel="noopener noreferrer" aria-label="Pedir ${escape(offer.label)} de ${escape(product.name)} na Logzz">Pedir ${escape(offer.label)} · pagar na entrega ${icon('arrow')}</a>` : '<button class="button primary order-button" type="button" disabled>Oferta indisponível no momento</button>';
  }
  function home() {
    document.title = 'Chega — gostou, chegou, pagou.';
    currentProduct = null;
    const product = config.products[0];
    main.innerHTML = `<section class="hero container">
      <div class="hero-copy"><h1>Gostou.<br>Chegou.<br><span>Pagou.</span></h1><p>Encontre algo para o seu dia.<br>O pagamento? Só quando o produto<br class="desktop-break"> chegar na sua casa.</p><div class="hero-actions"><a class="button primary" href="#catalogo">Explorar a loja ${icon('arrow')}</a><a class="hero-secondary" href="#como-funciona">Entenda como funciona</a></div><div class="hero-note">${icon('check')}Sem pagamento antecipado</div></div>
      <div class="hero-visual"><a href="#produto/${encodeURIComponent(product.id)}" class="hero-photo real-product-hero" aria-label="Conhecer ${escape(product.name)}"><img src="${escape(product.image)}" alt="${escape(product.imageAlt)}" fetchpriority="high" width="1000" height="1000"><span class="hero-image-caption">${escape(product.name)}</span></a><div class="delivery-slip">${icon('box')}<div><strong>Primeiro, chega.</strong><span>Depois, você paga na entrega.</span></div>${icon('check','slip-check')}</div><span class="image-disclaimer">Fotos e demonstração do material do produtor</span></div>
    </section>
    <div class="service-line"><div class="container"><span>${icon('truck')}Disponibilidade conforme seu CEP</span><span>${icon('box')}Um kit por pedido</span><a href="#ajuda">${icon('chat')}Atendimento acessível</a></div></div>
    <section class="catalog-section container" id="catalogo"><div class="section-heading"><div><h2>Seu próximo achado.</h2><p>Escolha com calma. Conheça cada detalhe.</p></div><span class="catalog-status">${config.products.length} produto${config.products.length === 1 ? '' : 's'} no catálogo</span></div><div class="catalog-tools"><div class="category-tabs" role="group" aria-label="Filtrar produtos por categoria">${['Todos', ...new Set(config.products.map(product => product.category))].map(name => `<button class="category-tab ${category === name ? 'active' : ''}" type="button" data-category="${escape(name)}" aria-pressed="${category === name}">${escape(name)}</button>`).join('')}</div><span id="search-status" role="status">${query ? `Busca: ${escape(query)}` : 'Uma seleção que vai crescer com você.'}</span></div><div class="product-grid" id="product-grid">${catalogHTML()}</div><div class="catalog-pagination"><button class="button secondary" id="catalog-more" type="button" data-action="more-products" aria-controls="product-grid" hidden>Ver mais produtos ${icon('arrow')}</button></div></section>
    <section class="how-section" id="como-funciona"><div class="container how-layout"><div><h2>Você escolhe.<br>A gente explica<br>o caminho.</h2><p>Uma compra simples, com as condições claras antes de pedir.</p><a class="text-button" href="#ajuda">Ainda tem uma dúvida? ${icon('arrow')}</a></div><ol class="how-steps"><li><span class="step-number">1</span><div><h3>Encontre seu produto</h3><p>Veja a descrição e escolha uma das opções disponíveis na oferta.</p></div></li><li><span class="step-number">2</span><div><h3>Confira a entrega</h3><p>No checkout da oferta, consulte seu CEP, a disponibilidade e as condições antes de confirmar.</p></div></li><li><span class="step-number">3</span><div><h3>Receba e pague</h3><p>O pagamento acontece na entrega, pelos meios aceitos na oferta.</p></div></li></ol></div><div class="container how-footnote">Seu pedido é confirmado no checkout da Logzz. Confira as condições da oferta e a disponibilidade pelo CEP antes de concluir.</div></section>
    <section class="help-section container" id="ajuda"><div class="help-intro"><h2>Perguntas pequenas.<br>Respostas claras.</h2><p>Saiba o que esperar antes de fazer seu pedido.</p><button class="button secondary" data-action="open-chat" type="button">${icon('chat')}Abrir ajuda rápida</button><a class="text-button" data-wa="Olá! Tenho uma dúvida sobre a loja.">Conversar no WhatsApp ${icon('arrow')}</a></div><div class="faq-list">${faqList(config.faq.slice(0,4))}</div></section>`;
    renderCatalog();
    setupLinks();
  }
  function productPage(id) {
    const product = model.findProduct(id);
    if (!product) { currentProduct = null; main.innerHTML = `<section class="container missing-page"><h1>Esse produto não foi encontrado.</h1><p>Veja os produtos disponíveis no catálogo.</p><a class="button primary" href="#catalogo">Voltar à loja ${icon('arrow')}</a></section>`; return; }
    currentProduct = product;
    currentOffer = product.offers[0].id;
    galleryIndex = 0;
    const bestUnitPrice = Math.min(...product.offers.map(offer => offer.priceCents / offer.quantity));
    document.title = `${product.name} — Chega`;
    main.innerHTML = `<section class="product-section container">
      <nav class="breadcrumbs" aria-label="Caminho da página"><a href="#inicio">Início</a><span>/</span><a href="#catalogo">Produtos</a><span>/</span><span>${escape(product.category)}</span></nav>
      <div class="product-layout">
        ${galleryHTML(product)}
        <div class="product-info">
          <h1>${escape(product.name)}</h1><p class="product-summary">${escape(product.summary)}</p><p>${escape(product.description)}</p>
          <div class="product-quick-links"><span>${icon('box')}Pague na entrega</span>${product.video ? `<button class="text-button" type="button" data-action="show-video">${icon('play')}Ver demonstração</button>` : ''}</div>
          <div class="product-price"><strong id="offer-price" aria-live="polite">${money(product.offers[0].priceCents)}</strong><span id="offer-unit-price">${money(product.offers[0].priceCents / product.offers[0].quantity)} por unidade</span></div>
          <fieldset class="offer-selector offer-grid" id="product-offers"><legend>Escolha a quantidade</legend>${product.offers.map((offer, i) => `<label class="offer-option"><input type="radio" name="offer" value="${escape(offer.id)}" ${i === 0 ? 'checked' : ''}><span><strong>${escape(offer.label)}</strong><b>${money(offer.priceCents)}</b><small>${money(offer.priceCents / offer.quantity)} / unidade</small>${offer.quantity > 1 && offer.priceCents / offer.quantity === bestUnitPrice ? '<span class="offer-hint">Menor valor por unidade</span>' : ''}</span></label>`).join('')}</fieldset>
          <div id="purchase-action">${purchaseHTML(product, product.offers[0])}</div><p class="order-explanation">Você seguirá para a Logzz para conferir entrega e confirmar este kit. Para outro produto, faça um novo pedido.</p>
          <div class="payment-note">${icon('box')}<div><strong>Receba primeiro. Pague na entrega.</strong><span>Confira CEP, entrega e valor final na Logzz antes de confirmar.</span></div></div>
          <div class="warranty-note">${icon('check')}<p>${escape(product.warranty || 'Consulte as condições da oferta.')}</p></div>
          <a class="product-support" data-wa="Olá! Quero saber mais sobre ${escape(product.name)}.">${icon('wa')}Tirar uma dúvida sobre este produto</a>
          <p class="affiliate-note">Oferta de ${escape(product.producer || 'produtor parceiro')}. A loja divulga o produto como afiliada e pode receber comissão pelas compras feitas por seus links.</p>
        </div>
      </div>
      ${videoHTML(product)}
      <div class="product-details-grid"><section><h2>Conheça os detalhes.</h2><dl class="spec-list">${(product.details || []).map(([key, value]) => `<div><dt>${escape(key)}</dt><dd>${escape(value)}</dd></div>`).join('')}</dl></section><section><h2>Antes de escolher.</h2><div class="faq-list">${faqList([...(product.faq || []), config.faq[0], config.faq[1]])}</div><button class="text-button" type="button" data-action="open-chat">Mais dúvidas? Abra a ajuda ${icon('arrow')}</button></section></div>
    </section>`;
    setupLinks();
    initProductMedia();
  }
  function renderAccount() {
    currentProduct = null;
    document.title = 'Minha conta — Chega';
    const register = accountTab === 'cadastro';
    const recover = accountTab === 'recuperar';
    main.innerHTML = `<section class="account-section container"><div class="account-intro"><h1>Um espaço<br>para você.</h1><p>Conheça a loja no seu tempo.<br>Para explorar, você não precisa de uma conta.</p><a class="text-button" href="#catalogo">Continuar na loja ${icon('arrow')}</a></div><div class="account-form-area"><div class="account-tabs" role="group" aria-label="Opções da conta"><button type="button" data-account="login" class="${!register ? 'active' : ''}" aria-pressed="${!register}">Entrar</button><button type="button" data-account="cadastro" class="${register ? 'active' : ''}" aria-pressed="${register}">Criar conta</button></div><h2>${recover ? 'Recuperar acesso' : register ? 'Vamos começar?' : 'Bom ter você por aqui.'}</h2><div class="account-notice">${icon('user')}<p>O acesso será liberado em breve. Esta tela é uma prévia e não envia nem salva seus dados.</p></div><form id="account-form"><fieldset disabled aria-describedby="account-status">${register ? '<label for="account-name">Seu nome</label><input id="account-name" type="text" placeholder="Como podemos chamar você?" autocomplete="off">' : ''}<label for="account-email">E-mail</label><input id="account-email" type="email" placeholder="voce@exemplo.com" autocomplete="off">${!recover ? '<label for="account-password">Senha</label><input id="account-password" type="password" placeholder="Digite sua senha" autocomplete="off">' : ''}${register ? '<label for="account-password-repeat">Confirme a senha</label><input id="account-password-repeat" type="password" placeholder="Digite novamente" autocomplete="off"><label class="checkbox-label"><input type="checkbox"><span>Li as condições de compra e a política de privacidade.</span></label><label class="checkbox-label"><input type="checkbox"><span>Quero receber novidades e ofertas (opcional).</span></label>' : ''}<button type="submit" class="button primary">${recover ? 'Enviar link de recuperação' : register ? 'Criar minha conta' : 'Entrar na minha conta'}</button></fieldset><p id="account-status" class="form-status">Cadastro e autenticação ainda não habilitados.</p></form>${!register ? `<button type="button" class="text-button" data-account="${recover ? 'login' : 'recuperar'}">${recover ? 'Voltar para entrar' : 'Esqueci minha senha'}</button>` : ''}<div class="account-legal"><a href="#termos">Condições de compra</a><a href="#privacidade">Política de privacidade</a></div></div></section>`;
  }
  const legalPages = {
    privacidade: { title: 'Sua privacidade, com clareza.', intro: 'Como este catálogo funciona e onde seus dados são usados.', content: `<h2>Dados neste catálogo</h2><p>O catálogo não armazena sua seleção de produtos nem coleta nome, e-mail, endereço, CPF ou senha. A escolha de um kit vale para a página atual. O carrinho da versão anterior é removido automaticamente deste navegador quando você abre esta versão.</p><h2>Pedidos na Logzz</h2><p>Ao continuar pela oferta, você acessa o checkout externo da Logzz. Os dados necessários ao pedido são preenchidos nesse serviço e seguem suas condições e política de privacidade. Este catálogo não recebe nem armazena esses campos.</p><h2>Atendimento no WhatsApp</h2><p>Ao abrir o WhatsApp, você utiliza um serviço externo. Os dados que escolher compartilhar na conversa serão tratados nesse serviço e pelo atendimento. Não envie senhas ou dados de cartão.</p><h2>Preferências e publicidade</h2><p>Este catálogo não integra pixels de marketing, análise de visitas ou cadastro de novidades. O cadastro e o login da loja ainda não estão habilitados. A política será atualizada quando essas funcionalidades forem implementadas.</p><h2>Solicitações</h2><p>Para dúvidas sobre o catálogo ou dados compartilhados com o atendimento, use o WhatsApp disponível no site. Para os dados de seu pedido, consulte também os canais informados no checkout da Logzz.</p>` },
    termos: { title: 'Condições claras antes de pedir.', intro: 'Conheça o caminho da sua compra e confira a oferta antes de confirmar.', content: `<h2>Catálogo de afiliados</h2><p>A Chega apresenta ofertas de parceiros e pode receber comissão por compras realizadas através de seus links de afiliado. O responsável pelo produto é indicado em sua página e nas condições da oferta. O pedido é confirmado no checkout externo da Logzz.</p><h2>Um kit por pedido</h2><p>Escolha um produto e seu kit. O botão da oferta encaminha para o checkout correspondente na Logzz. Para comprar outro produto, volte ao catálogo e faça um pedido separado. Não há carrinho ou compra conjunta de produtos diferentes.</p><h2>Pagamento na entrega</h2><p>O pagamento é realizado na entrega, conforme as condições da oferta. Antes de confirmar, confira no checkout seu CEP, disponibilidade, prazo, valor final, possíveis custos e acréscimos, meios de pagamento e identificação do responsável pela oferta.</p><h2>Preços e disponibilidade</h2><p>Os preços cadastrados correspondem aos valores conferidos nos links da oferta e podem ser atualizados pelo produtor. O valor final deve ser conferido no checkout antes da confirmação. Este catálogo não consulta estoque ou datas de entrega em tempo real.</p><h2>Informações do produto</h2><p>As fotos e o vídeo são materiais de divulgação de divulgação do fornecedor. A demonstração não representa avaliação verificada pela loja nem garante um resultado específico. Leia o rótulo e siga as instruções do fabricante.</p><h2>Atendimento</h2><p>O WhatsApp do catálogo está disponível para dúvidas. Para condições do pedido, troca, cancelamento e garantia, consulte também a oferta e os canais do produtor na Logzz.</p>` },
    trocas: { title: 'Ajuda também depois da entrega.', intro: 'Converse com o atendimento e consulte as condições da sua oferta.', content: `<h2>Fale com o atendimento</h2><p>Use o WhatsApp para tirar dúvidas ou solicitar orientações. Se você já fez um pedido, informe o produto e a identificação do pedido. Evite enviar senhas, dados de cartão ou documentos sem necessidade.</p><a class="button primary" data-wa="Olá! Preciso de ajuda com um pedido, troca ou devolução de um produto.">Abrir WhatsApp ${icon('wa')}</a><h2>Garantia informada pelo produtor</h2><p>Consulte a garantia informada na página do produto e confira as condições aplicáveis na oferta e nos canais do produtor. Essa informação não substitui as condições do pedido nem limita os direitos aplicáveis à compra.</p><h2>Pedidos, cancelamentos e devoluções</h2><p>O pedido é confirmado na Logzz. Consulte os canais apresentados no checkout para solicitar acompanhamento, cancelamento, troca ou devolução. O atendimento do catálogo pode orientar você sobre onde encontrar essas informações.</p>` }
  };
  function renderLegal(key) {
    currentProduct = null;
    const page = legalPages[key];
    document.title = `${key === 'privacidade' ? 'Privacidade' : key === 'termos' ? 'Condições de compra' : 'Atendimento'} — Chega`;
    main.innerHTML = `<article class="legal-page container"><a href="#inicio" class="text-button">Voltar à loja ${icon('arrow')}</a><h1>${page.title}</h1><p class="legal-intro">${page.intro}</p><div class="legal-status">Informações deste catálogo · confira também as condições da oferta na Logzz.</div><div class="legal-content">${page.content}</div></article>`;
    setupLinks();
  }
  function closeChat(restore = true) {
    chatPanel.hidden = true;
    if (restore && chatReturnFocus?.isConnected) chatReturnFocus.focus();
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
    $('#product-video-player')?.pause();
    closeChat(false);
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
        case 'gallery-prev': selectPhoto(galleryIndex - 1); break;
        case 'gallery-next': selectPhoto(galleryIndex + 1); break;
        case 'show-video': { closeChat(false); const video = $('#product-video'); video.open = true; video.scrollIntoView({ block: 'start' }); video.querySelector('summary').focus({ preventScroll: true }); break; }
        case 'back-to-offers': $('#product-offers').scrollIntoView({ block: 'center' }); $('#product-offers input:checked').focus({ preventScroll: true }); break;
        case 'retry-video': $('#video-status').textContent = ''; $('#product-video-player').load(); break;
        case 'open-chat': openChat(); break;
        case 'close-chat': closeChat(); break;
        case 'more-products': { const firstNewIndex = catalogLimit; catalogLimit += catalogPageSize; renderCatalog(); $('#product-grid').querySelectorAll('.product-card h3 a')[firstNewIndex]?.focus(); break; }
        case 'reset-filters': query = ''; category = 'Todos'; catalogLimit = catalogPageSize; $('#search-input').value = ''; home(); $('#catalogo').scrollIntoView(); break;
      }
    }
    const photoButton = event.target.closest('[data-photo]');
    if (photoButton) selectPhoto(Number(photoButton.dataset.photo));
    const categoryButton = event.target.closest('[data-category]');
    if (categoryButton) {
      category = categoryButton.dataset.category;
      catalogLimit = catalogPageSize;
      document.querySelectorAll('[data-category]').forEach(element => { element.classList.toggle('active',element.dataset.category === category); element.setAttribute('aria-pressed',String(element.dataset.category === category)); });
      renderCatalog();
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
      if (!offer) return;
      $('#purchase-action').innerHTML = purchaseHTML(currentProduct, offer);
      $('#offer-price').textContent = money(offer.priceCents);
      $('#offer-unit-price').textContent = `${money(offer.priceCents / offer.quantity)} por unidade`;
    }
  });
  $('#search-form').addEventListener('submit',event => {
    event.preventDefault(); query = $('#search-input').value.trim(); category = 'Todos'; catalogLimit = catalogPageSize;
    if (location.hash === '#catalogo') { home(); $('#catalogo').scrollIntoView(); }
    else location.hash = 'catalogo';
  });
  document.addEventListener('submit',event => { if (event.target.id === 'account-form') event.preventDefault(); });
  document.addEventListener('keydown',event => { if (event.key === 'Escape' && !chatPanel.hidden) closeChat(); });
  window.addEventListener('hashchange',renderRoute);
  $('#year').textContent = new Date().getFullYear();
  setupLinks(); renderRoute();
})();
