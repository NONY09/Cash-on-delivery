(function () {
  'use strict';
  const productURL = id => '/produto/' + encodeURIComponent(id) + '/';
  function resolve(location) {
    const hash = (location.hash || '').replace(/^#/, '');
    const path = (location.pathname || '/').replace(/\/+$/, '') || '/';
    if (hash.startsWith('produto/')) {
      try { return { type: 'product', id: decodeURIComponent(hash.slice(8)), legacy: true }; }
      catch { return { type: 'missing' }; }
    }
    if (['conta','privacidade','termos','trocas'].includes(hash)) return { type: hash, legacy: true };
    if (path.startsWith('/produto/')) {
      try { return { type: 'product', id: decodeURIComponent(path.slice(9)) }; }
      catch { return { type: 'missing' }; }
    }
    if (path === '/') return { type: 'home', section: ['catalogo','como-funciona','ajuda'].includes(hash) ? hash : '' };
    if (['/conta','/privacidade','/termos','/trocas'].includes(path)) return { type: path.slice(1) };
    return { type: 'missing' };
  }
  const url = route => route.type === 'product' ? productURL(route.id) : route.type === 'home' ? '/' + (route.section ? '#' + route.section : '') : '/' + route.type + '/';
  window.ChegaRoutes = Object.freeze({ productURL, resolve, url });
})();
