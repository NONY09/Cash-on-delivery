(function () {
  'use strict';
  function mount(root) {
    if (!root) return null;
    const action = document.querySelector('#purchase-action');
    const overlayOpen = () => document.querySelector('#chat-panel')?.hidden === false || document.querySelector('#privacy-preferences')?.hidden === false;
    let visible = false, interrupted = overlayOpen(), destroyed = false;
    const paint = () => {
      if (destroyed) return;
      root.hidden = visible || interrupted;
      document.body.classList.toggle('purchase-dock-visible', !root.hidden);
    };
    const observer = window.IntersectionObserver ? new window.IntersectionObserver(entries => {
      visible = entries.some(entry => entry.isIntersecting && entry.intersectionRatio >= .75); paint();
    }, { threshold: [.75] }) : null;
    const interrupt = event => { interrupted = Boolean(event.detail) || overlayOpen(); paint(); };
    const focus = () => {
      const el = document.activeElement;
      interrupted = overlayOpen() || Boolean(el && /^(TEXTAREA|INPUT)$/.test(el.tagName) && !/^(radio|checkbox)$/.test(el.type));
      paint();
    };
    document.addEventListener('chega:overlay', interrupt);
    document.addEventListener('focusin', focus);
    const blur = () => queueMicrotask(focus);
    document.addEventListener('focusout', blur);
    if (action) observer?.observe(action);
    paint();
    return { refresh: paint, destroy() {
      destroyed = true; observer?.disconnect();
      document.removeEventListener('chega:overlay', interrupt);
      document.removeEventListener('focusin', focus); document.removeEventListener('focusout', blur);
      document.body.classList.remove('purchase-dock-visible');
    } };
  }
  window.ChegaPurchaseDock = Object.freeze({ mount });
})();
