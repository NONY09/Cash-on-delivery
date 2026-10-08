/* Catálogo de afiliados: uma oferta por pedido, sem carrinho. */
(function () {
  'use strict';
  const config = window.CHEGA_CONFIG;
  const findProduct = id => config.products.find(product => product.id === id);
  function checkout(productId, offerId) {
    const product = findProduct(productId);
    const offer = product?.offers.find(item => item.id === offerId);
    if (!offer || config.demoMode || product.demo || !Number.isSafeInteger(offer.quantity) || offer.quantity < 1 || !Number.isSafeInteger(offer.priceCents) || offer.priceCents < 0) return null;
    try {
      const url = new URL(offer.checkoutUrl);
      // Preserve o link completo do kit; nunca combine produtos ou altere a URL.
      return url.protocol === 'https:' && url.hostname === 'entrega.logzz.com.br' && !url.username && !url.password ? offer.checkoutUrl : null;
    } catch { return null; }
  }
  window.ChegaStore = Object.freeze({ findProduct, checkout, productURL: id => window.ChegaRoutes.productURL(id) });
})();
