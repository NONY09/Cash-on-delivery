# Chega — loja com pagamento na entrega

Primeira estrutura visual. Nome provisório, catálogo público, busca e categorias, página de produto, carrinho com um tipo de produto por pedido, kits específicos por oferta, FAQ em formato de conversa, suporte WhatsApp e telas de conta. Sem dependências ou etapa de build.

## Ver no computador
Abra `index.html`. Navegação e arquivos são relativos, funcionando também pelo arquivo local. Para um servidor simples opcional, execute `python3 -m http.server 8080` nesta pasta e acesse `http://localhost:8080`.

## Repositório e publicação automática
Repositório principal: https://github.com/NONY09/Cash-on-delivery
Branch de trabalho e publicação: `main`.

As atualizações devem ser enviadas para esse repositório, conectado ao Netlify pelo usuário. A configuração está em `netlify.toml`: sem comando de build, diretório de publicação `.`. Os arquivos da loja ficam na raiz do repositório. A confirmação de cada deploy depende do status retornado pelo Netlify; um commit no GitHub, por si só, não comprova publicação bem-sucedida.

## Upload manual opcional da cópia ZIP
1. Extraia o ZIP.
2. Faça o upload da pasta `chega-loja`, a pasta que contém `index.html`, no deploy manual do Netlify.
3. Se usar Git, deixe o comando de build vazio e o diretório de publicação como `.`.

O arquivo `_headers` cobre o upload manual. O fluxo principal é GitHub → Netlify. A prévia está marcada para não ser indexada.

## Trocar produtos e ofertas
Edite `products.js`. Adicione um objeto na lista `products` para cada produto. Cada produto precisa de um `id` único, nome, categoria, imagem local e texto verificado. Os preços são inteiros em centavos: `9990` representa R$ 99,90. Cada entrada de `offers` corresponde a um kit fixo, com sua própria quantidade, valor e `checkoutUrl` de afiliado. Cadastre somente kits realmente disponíveis. O código não soma produtos diferentes e exige confirmação antes de substituir o atual.

Preserve o link HTTPS completo de afiliado fornecido para cada oferta, inclusive identificadores e parâmetros. Confira o domínio do parceiro. Não insira senha, segredo, chave privada ou credenciais em nenhum arquivo.

## Estado desta entrega
- Produto, imagem e preços são demonstrativos e identificados assim na interface.
- Carrinho funciona, fica salvo localmente sem dados pessoais e pode ser limpo na página de privacidade.
- Finalização está bloqueada: nenhum pedido ou pagamento é enviado.
- Login, cadastro e recuperação têm sua estrutura visual; os campos e envios estão desabilitados, sem coletar senhas.
- Ajuda utiliza respostas cadastradas e WhatsApp +55 81 99688-1704. Não há API de IA ou custo de processamento.
- Políticas são textos iniciais sobre a prévia, com identificação e condições definitivas pendentes. Não constituem garantia de conformidade jurídica.
- Não há pixel, analytics, trackers, chamadas de backend ou coleta de endereço.

## Próxima etapa: operação real e Supabase
Conectar autenticação apenas após configurar o projeto real, confirmação de e-mail, recuperação de senha, redirecionamentos permitidos, regras de acesso/RLS para os dados de cada usuário, proteção contra abuso e separação de consentimentos. Usar somente chave publicável no cliente; nunca `service_role`. Não armazenar senhas manualmente. Definir previamente os dados mínimos de pedidos e seus responsáveis.

Publicar identificação verdadeira da loja e dos responsáveis pelas ofertas, conteúdo do produto, estoque/cobertura, prazos, possíveis custos de entrega, meios aceitos e condições de atendimento. Revisar as políticas definitivas conforme a operação real. O pagamento na entrega evita pagamento antecipado; não garante ausência de golpes nem autoriza prometer isso.

Após essas etapas: substituir imagem e valores fictícios, cadastrar ofertas reais, marcar cada produto real com `demo: false`, e somente então ajustar `demoMode: false`. Trocar o banner de prévia, textos de demonstração, `robots.txt` e a meta `robots`. A CSP bloqueia conexões nesta versão (`connect-src 'none'`); revise com os domínios exatos necessários ao Supabase, sem liberar indiscriminadamente. Nunca desabilitar a proteção apenas para fazer a integração funcionar.

## Imagem e fontes
Imagem conceitual produzida com a ferramenta integrada de geração de imagens. Prompt final: fotografia de estúdio para catálogo de uma única escova facial oval de silicone coral, sem marca, cerdas detalhadas e botão discreto, fundo pêssego, luz natural suave pela esquerda e sombra pela direita, composição quadrada centralizada, sem textos ou acessórios. Arquivo: `assets/escova-demo.webp`.

Prompt completo e origem registrados em `assets/IMAGE_SOURCE.txt`. Fontes URW Gothic e Nimbus Sans servidas localmente. Licenças e avisos em `assets/fonts/LICENSE.txt`.

## Verificação
A entrega inclui validação de sintaxe JavaScript, caminhos dos arquivos, contraste da paleta e testes das regras centrais do carrinho e bloqueio de checkout de demonstração. Capturas e testes em navegador não foram realizados neste ambiente; revise no Netlify em celular e desktop antes de abrir as vendas.
