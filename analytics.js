/* Não mede vendas: apenas eventos da vitrine, após consentimento e configuração. */
(function () {
  'use strict';
  const config = window.CHEGA_SITE?.analytics || {};
  const meta = /^\d{5,25}$/.test(config.metaPixelId || '') ? config.metaPixelId : '';
  const google = /^G-[A-Z0-9]+$/.test(config.googleMeasurementId || '') ? config.googleMeasurementId : '';
  const configured = Boolean(meta || google);
  const key = 'chega-privacy-v1';
  let choice = null, started = false, returnFocus = null;
  try { choice = JSON.parse(localStorage.getItem(key)); } catch { /* No consent assumed. */ }
  if (choice?.version !== 1) choice = null;
  const granted = () => configured && choice?.analytics === true;
  function load(src) { const script = document.createElement('script'); script.src = src; script.async = true; document.head.append(script); }
  function start() {
    if (!granted() || started) return;
    started = true;
    if (google) {
      window.dataLayer = window.dataLayer || [];
      window.gtag = function () { window.dataLayer.push(arguments); };
      window.gtag('js', new Date()); window.gtag('config', google, { send_page_view: false, allow_google_signals: false, allow_ad_personalization_signals: false });
      load('https://www.googletagmanager.com/gtag/js?id=' + google);
    }
    if (meta) {
      const fbq = function () { fbq.callMethod ? fbq.callMethod.apply(fbq, arguments) : fbq.queue.push(arguments); };
      fbq.queue = []; fbq.loaded = true; fbq.version = '2.0'; window.fbq = fbq;
      window.fbq('set', 'autoConfig', false, meta); window.fbq('init', meta); window.fbq('consent', 'grant'); load('https://connect.facebook.net/en_US/fbevents.js');
    }
  }
  function track(name, product, offer) {
    if (!granted() || !['page_view','view_item','select_item','checkout_redirect','contact_click'].includes(name)) return;
    start();
    const data = product ? { item_id: product.id, item_name: product.name, item_category: product.category } : {};
    if (offer) Object.assign(data, { offer_id: offer.id, quantity: offer.quantity, value: offer.priceCents / 100, currency: 'BRL' });
    if (google) window.gtag('event', name, data);
    if (meta) window.fbq('trackCustom', name, data);
  }
  function show() {
    const panel = document.querySelector('#privacy-preferences');
    if (!panel) return;
    returnFocus = document.activeElement;
    panel.hidden = false;
    document.dispatchEvent(new CustomEvent('chega:overlay', { detail: true }));
    panel.querySelector('button')?.focus();
  }
  function save(analytics) {
    choice = { analytics, version: 1 };
    try { localStorage.setItem(key, JSON.stringify(choice)); } catch { /* Choice still applies in memory. */ }
    if (!analytics && window.fbq) window.fbq('consent', 'revoke');
    document.querySelector('#privacy-preferences').hidden = true;
    document.dispatchEvent(new CustomEvent('chega:overlay', { detail: false }));
    // Reload on revocation removes loaded providers and stops their future execution.
    if (!analytics && started) { window.location.reload(); return; }
    start();
    if (returnFocus?.isConnected) returnFocus.focus({ preventScroll: true });
  }
  document.addEventListener('click', event => {
    if (event.target.closest('[data-privacy-open]')) show();
    if (event.target.closest('[data-privacy-accept]')) save(true);
    if (event.target.closest('[data-privacy-reject]')) save(false);
  });
  const link = document.querySelector('#privacy-open');
  if (link) link.hidden = !configured;
  const services = document.querySelector('#privacy-services');
  if (services) services.textContent = [google ? 'Google Analytics: estatísticas de navegação.' : '', meta ? 'Meta Pixel: medição de anúncios.' : ''].filter(Boolean).join(' ');
  if (configured && !choice) show(); else start();
  window.ChegaAnalytics = Object.freeze({ configured, track });
})();
