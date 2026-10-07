/* Regras independentes da interface: um único produto e uma oferta válida. */
(function () {
  'use strict';
  const config = window.CHEGA_CONFIG;
  const findProduct = id => config.products.find(product => product.id === id);
  function resolveCart(cart) {
    if (!cart || typeof cart.productId !== 'string' || typeof cart.offerId !== 'string') return null;
    const product = findProduct(cart.productId);
    const offer = product?.offers.find(item => item.id === cart.offerId);
    if (!product || !offer || !Number.isSafeInteger(offer.priceCents) || offer.priceCents < 0 || !Number.isSafeInteger(offer.quantity) || offer.quantity < 1) return null;
    return { product, offer };
  }
  function normalize(cart) {
    const item = resolveCart(cart);
    return item ? { productId: item.product.id, offerId: item.offer.id } : null;
  }
  function select(current, productId, offerId, replace = false) {
    const next = normalize({ productId, offerId });
    if (!next) return { status: 'invalid', cart: normalize(current) };
    if (normalize(current) && current.productId !== productId && !replace) return { status: 'replace-required', cart: normalize(current), next };
    return { status: 'selected', cart: next };
  }
  function checkout(item) {
    if (!item || config.demoMode || item.product.demo) return null;
    try {
      const url = new URL(item.offer.checkoutUrl);
      // Nunca construir o link: preserve exatamente o link de afiliado cadastrado.
      return url.protocol === 'https:' && !url.username && !url.password ? item.offer.checkoutUrl : null;
    } catch { return null; }
  }
  window.ChegaStore = Object.freeze({ findProduct, resolveCart, normalize, select, checkout });
})();
