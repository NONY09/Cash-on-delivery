/* Edite este arquivo para adicionar produtos reais. Valores em centavos. */
window.CHEGA_CONFIG = {
  name: 'Chega',
  whatsapp: '5581996881704',
  demoMode: true, // Mantenha true até revisar as ofertas, os dados da loja e as políticas.
  storageKey: 'chega-cart-v1',
  products: [{
    id: 'escova-facial',
    name: 'Escova facial de silicone',
    category: 'Autocuidado',
    image: 'assets/escova-demo.webp',
    imageAlt: 'Imagem conceitual de uma escova facial oval de silicone coral',
    demo: true,
    summary: 'Um cuidado a mais na sua rotina.',
    description: 'Este produto de exemplo mostra como sua oferta vai aparecer: foto em destaque, descrição clara e opções de compra fáceis de escolher. Substitua este texto pelas informações verificadas do fabricante.',
    details: [
      ['Produto', 'Escova facial de silicone — exemplo de catálogo'],
      ['Cor', 'Coral — ilustrativa'],
      ['Conteúdo', 'Cadastrar os itens reais incluídos na oferta'],
      ['Uso e cuidados', 'Adicionar as instruções e restrições do fabricante']
    ],
    // Cada oferta é um kit fixo. Não existe incremento livre de quantidade.
    offers: [
      { id: 'uma-unidade', label: '1 unidade', quantity: 1, priceCents: 9990, checkoutUrl: null },
      { id: 'duas-unidades', label: 'Kit com 2 unidades', quantity: 2, priceCents: 16990, checkoutUrl: null }
    ],
    faq: [
      { question: 'Como usar essa escova?', answer: 'Este é um produto de demonstração. Quando a oferta real for cadastrada, as instruções de uso e cuidados do fabricante aparecerão aqui. Por enquanto, nenhuma característica técnica está confirmada.' },
      { question: 'O que vem na embalagem?', answer: 'O conteúdo será informado conforme a oferta real. A foto desta prévia é uma imagem conceitual e não confirma acessórios ou especificações.' }
    ]
  }],
  faq: [
    { question: 'Quando eu pago?', answer: 'Na entrega do produto, conforme as condições da oferta. Você não faz pagamento antecipado pela loja. Nesta prévia, nenhuma compra pode ser concluída.' },
    { question: 'Entrega na minha região?', answer: 'A disponibilidade depende do produto, do estoque e do seu CEP. Na loja definitiva, essa consulta será feita no checkout da oferta antes de confirmar o pedido. Ainda não há cobertura ativa nesta prévia.' },
    { question: 'Posso pedir mais de uma unidade?', answer: 'Você escolhe uma das opções cadastradas para o produto, como uma unidade ou um kit. As quantidades válidas serão as permitidas pela oferta real. Cada pedido contém apenas um tipo de produto.' },
    { question: 'Preciso criar uma conta?', answer: 'Você pode conhecer a loja sem criar conta. As telas de cadastro e acesso já estão preparadas, mas ainda não estão habilitadas nesta prévia.' },
    { question: 'Como funciona o pagamento?', answer: 'O pagamento ocorre na entrega. Os meios aceitos, como dinheiro, Pix ou cartão, deverão ser conferidos nas condições da oferta real. Nenhum meio específico está confirmado nesta prévia.' },
    { question: 'Como pedir uma troca ou ajuda?', answer: 'Fale com o atendimento pelo WhatsApp. Na versão definitiva, a identificação do responsável, os canais e as condições de troca serão publicados antes de abrir as vendas.' }
  ]
};
