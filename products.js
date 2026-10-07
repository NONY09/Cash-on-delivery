/* Preços em centavos. Links de afiliado preservados completos por oferta. */
window.CHEGA_CONFIG = {
  name: 'Chega',
  whatsapp: '5581996881704',
  demoMode: false, // O pedido é confirmado exclusivamente no checkout externo da Logzz.
  products: [{
    id: 'resina-extreme',
    name: 'Resina Extreme',
    category: 'Cuidados automotivos',
    image: 'assets/resina/produto.webp',
    imageAlt: 'Frasco de Resina Extreme finalizador automotivo de 500 ml',
    images: [
      { src: 'assets/resina/produto.webp', thumbnail: 'assets/resina/produto-thumb.webp', alt: 'Frasco de Resina Extreme de 500 ml — foto do material fornecido' },
      { src: 'assets/resina/carro.webp', thumbnail: 'assets/resina/carro-thumb.webp', alt: 'Material de divulgação da Resina Extreme com frasco e carro vermelho' }
    ],
    video: { visualDescription: 'Uma pessoa mostra o frasco da Resina Extreme e passa um pano amarelo pela pintura de um carro. É uma demonstração visual de aplicação; siga as instruções do rótulo para usar o produto.', src: 'assets/resina/demonstracao.mp4', poster: 'assets/resina/video-poster.jpg', title: 'Veja a Resina Extreme em ação', description: 'Vídeo de aplicação enviado pelo fornecedor. O resultado depende da superfície, do estado da pintura e do uso conforme o rótulo.' },
    demo: false,
    summary: 'Um cuidado a mais para o brilho do seu carro.',
    description: 'Finalizador automotivo em frasco de 500 ml. Conheça o produto, assista à demonstração e escolha a quantidade para sua rotina. Leia o rótulo e siga as instruções do fabricante antes de aplicar.',
    producer: 'Ares comércio e Distribuição ltda',
    warranty: 'Garantia de 7 dias informada pelo produtor. Consulte as condições da oferta antes de confirmar o pedido.',
    details: [
      ['Produto', 'Resina Extreme — resina auto brilho / finalizador'],
      ['Volume', '500 ml por frasco, conforme o rótulo nas fotos'],
      ['Produtor', 'Ares comércio e Distribuição ltda'],
      ['Quantidades', 'Kits de 1 a 6 frascos, conforme a opção escolhida'],
      ['Garantia', '7 dias informados pelo produtor; condições na oferta'],
      ['Uso e cuidados', 'Leia o rótulo e confirme a compatibilidade da superfície antes de aplicar']
    ],
    // Valores observados em cada checkout enviado pelo usuário em 07/10/2026 UTC.
    offers: [
      { id: 'resina-1', label: '1 unidade', quantity: 1, priceCents: 9999, checkoutUrl: 'https://entrega.logzz.com.br/pay/memxko4ee/1-por-9999-entrega-garantida' },
      { id: 'resina-2', label: '2 unidades', quantity: 2, priceCents: 12499, checkoutUrl: 'https://entrega.logzz.com.br/pay/memxko4ee/2-unidades-12499' },
      { id: 'resina-3', label: '3 unidades', quantity: 3, priceCents: 14700, checkoutUrl: 'https://entrega.logzz.com.br/pay/memxko4ee/kqzkr-3-por-147' },
      { id: 'resina-4', label: '4 unidades', quantity: 4, priceCents: 19700, checkoutUrl: 'https://entrega.logzz.com.br/pay/memxko4ee/xucsd-4-unidades' },
      { id: 'resina-5', label: '5 unidades', quantity: 5, priceCents: 18000, checkoutUrl: 'https://entrega.logzz.com.br/pay/memxko4ee/oferta-5180' },
      { id: 'resina-6', label: '6 unidades', quantity: 6, priceCents: 21000, checkoutUrl: 'https://entrega.logzz.com.br/pay/memxko4ee/6-resinas-por-210' }
    ],
    faq: [
      { question: 'O que é a Resina Extreme?', answer: 'É um finalizador automotivo, identificado no rótulo como resina auto brilho. Cada frasco das fotos tem 500 ml. Consulte o rótulo para as indicações de uso do fabricante.' },
      { question: 'Como aplicar e onde posso usar?', answer: 'Siga o modo de uso do rótulo. O vídeo mostra uma demonstração de aplicação; não substitui as instruções do fabricante. Confirme com o atendimento a compatibilidade com a superfície que você pretende tratar.' },
      { question: 'Qual é a garantia?', answer: 'O produtor informa garantia de 7 dias. Confira as condições na oferta e fale com o atendimento para saber como solicitar suporte.' },
      { question: 'O que vem no kit?', answer: 'A quantidade de frascos é a indicada na opção escolhida: de 1 a 6 unidades. Não prometemos acessórios que não estejam descritos na oferta. Confirme o conteúdo completo no checkout.' }
    ]
  }],
  faq: [
    { question: 'Quando eu pago?', answer: 'Você paga na entrega do produto, conforme as condições da oferta na Logzz. A loja não pede pagamento antecipado. Confira o resumo antes de confirmar seu pedido.' },
    { question: 'Entrega na minha região?', answer: 'A disponibilidade depende do produto, do estoque e do CEP. Ao continuar para a Logzz, consulte seu endereço e as datas disponíveis antes de confirmar. A loja não confirma estoque ou prazo em tempo real.' },
    { question: 'Posso pedir mais de uma unidade?', answer: 'Sim. Escolha um dos kits cadastrados para o produto. Cada pedido contém apenas um tipo de produto, na quantidade da opção escolhida.' },
    { question: 'Preciso criar uma conta?', answer: 'Você pode conhecer a loja e acessar a oferta sem criar uma conta aqui. O cadastro e o login da loja ainda não estão habilitados. Os dados necessários ao pedido são preenchidos diretamente no checkout da Logzz.' },
    { question: 'Quais formas de pagamento são aceitas?', answer: 'O checkout da Logzz apresenta as formas de pagamento para a entrega. Confira as opções, o total e possíveis acréscimos de parcelamento antes de confirmar o pedido.' },
    { question: 'Como pedir uma troca ou ajuda?', answer: 'Fale com o atendimento pelo WhatsApp e informe o produto e, se houver, a identificação do pedido. As condições aplicáveis também podem ser consultadas na oferta do produtor.' }
  ]
};
