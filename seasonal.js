(function () {
  'use strict';
  function mount(root = document) {
    const scenes = [...root.querySelectorAll('[data-holiday-scene]')];
    const button = root.querySelector('[data-holiday-toggle]');
    if (!button || !scenes.length) return null;
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const visible = new Map(scenes.map(scene => [scene, false]));
    let paused = false, destroyed = false;
    function paint() {
      const staticMode = paused || motion.matches;
      scenes.forEach(scene => scene.classList.toggle('holiday-motion', !destroyed && !staticMode && !document.hidden && visible.get(scene)));
      button.disabled = motion.matches;
      button.textContent = motion.matches ? 'Efeitos estáticos' : paused ? 'Ativar efeitos' : 'Pausar efeitos';
      button.setAttribute('aria-pressed', String(staticMode));
      button.setAttribute('aria-label', motion.matches ? 'Efeitos estáticos pela preferência de movimento reduzido' : paused ? 'Ativar efeitos decorativos de Natal' : 'Pausar efeitos decorativos de Natal');
    }
    function toggle() { paused = !paused; paint(); }
    const observer = typeof IntersectionObserver === 'function' ? new IntersectionObserver(entries => {
      entries.forEach(entry => visible.set(entry.target, entry.isIntersecting));
      paint();
    }, { threshold: .1 }) : null;
    observer && scenes.forEach(scene => observer.observe(scene));
    button.addEventListener('click', toggle);
    document.addEventListener('visibilitychange', paint);
    motion.addEventListener('change', paint);
    paint();
    return { destroy() {
      destroyed = true; paint(); observer?.disconnect();
      button.removeEventListener('click', toggle);
      document.removeEventListener('visibilitychange', paint);
      motion.removeEventListener('change', paint);
    } };
  }
  window.ChegaSeasonal = { mount };
  mount();
}());
