(function () {
  'use strict';
  function mount(root) {
    if (!root) return null;
    const track = root.querySelector('.banner-track');
    const slides = [...root.querySelectorAll('.banner-panel')];
    const dots = [...root.querySelectorAll('[data-banner-index]')];
    const pause = root.querySelector('[data-banner-pause]');
    const count = root.querySelector('.banner-count');
    const status = root.querySelector('.banner-status');
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let index = 0, stopped = motion.matches, visible = true, timer = null, destroyed = false;
    const listeners = [];
    const listen = (target, type, handler) => {
      target.addEventListener(type, handler);
      listeners.push(() => target.removeEventListener(type, handler));
    };
    function paint() {
      slides.forEach((slide, i) => { slide.inert = i !== index; slide.setAttribute('aria-hidden', String(i !== index)); });
      dots.forEach((dot, i) => { dot.setAttribute('aria-pressed', String(i === index)); });
      count.textContent = `${String(index + 1).padStart(2, '0')} / ${String(slides.length).padStart(2, '0')}`;
      pause.setAttribute('aria-label', stopped ? 'Iniciar passagem automática dos banners' : 'Pausar passagem automática dos banners');
      pause.setAttribute('aria-pressed', String(stopped));
      pause.disabled = motion.matches;
      pause.textContent = motion.matches ? 'Manual' : stopped ? 'Reproduzir' : 'Pausar';
      if (motion.matches) pause.setAttribute('aria-label', 'Passagem automática desativada pela preferência de movimento reduzido');
    }
    function clear() { window.clearTimeout(timer); timer = null; }
    function schedule() {
      clear();
      if (destroyed || stopped || motion.matches || !visible || document.hidden || root.contains(document.activeElement) || root.matches(':hover')) return;
      timer = window.setTimeout(() => { go(index + 1, false); }, 6500);
    }
    function stop() { stopped = true; clear(); paint(); }
    function go(next, manual = true) {
      index = ((next % slides.length) + slides.length) % slides.length;
      if (manual) stopped = true;
      paint();
      track.scrollTo({ left: index * track.clientWidth, behavior: motion.matches ? 'instant' : 'smooth' });
      if (manual) status.textContent = `Banner ${index + 1} de ${slides.length}: ${slides[index].dataset.bannerTitle}.`;
      schedule();
    }
    listen(root, 'click', event => {
      const button = event.target.closest('[data-banner-index], [data-banner-step], [data-banner-pause]');
      if (!button || !root.contains(button)) return;
      if (button.hasAttribute('data-banner-pause')) { stopped = !stopped; paint(); schedule(); }
      else if (button.hasAttribute('data-banner-index')) go(Number(button.dataset.bannerIndex));
      else go(index + Number(button.dataset.bannerStep));
    });
    listen(track, 'pointerdown', stop);
    listen(track, 'wheel', event => { if (Math.abs(event.deltaX) > 0) stop(); });
    listen(track, 'keydown', event => {
      if (event.target !== track) return;
      if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') { event.preventDefault(); go(index + (event.key === 'ArrowRight' ? 1 : -1)); }
    });
    listen(track, 'scroll', () => {
      const next = Math.round(track.scrollLeft / track.clientWidth);
      if (next >= 0 && next < slides.length && next !== index) { index = next; paint(); }
    });
    listen(root, 'mouseenter', clear);
    listen(root, 'mouseleave', schedule);
    listen(root, 'focusin', clear);
    listen(root, 'focusout', event => { if (!root.contains(event.relatedTarget)) schedule(); });
    listen(document, 'visibilitychange', schedule);
    listen(motion, 'change', () => { if (motion.matches) stopped = true; paint(); schedule(); });
    listen(window, 'resize', () => { track.scrollTo({ left: index * track.clientWidth, behavior: 'instant' }); });
    const observer = typeof IntersectionObserver === 'function' ? new IntersectionObserver(entries => {
      visible = entries[0].isIntersecting; schedule();
    }, { threshold: .25 }) : null;
    observer?.observe(root);
    paint(); schedule();
    return { destroy() { destroyed = true; clear(); observer?.disconnect(); listeners.forEach(remove => remove()); } };
  }
  window.ChegaBanner = { mount };
}());
