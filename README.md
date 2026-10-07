# Chega — loja com pagamento na entrega

Loja afiliada com a Resina Extreme e ofertas reais da Logzz. Nome provisório, catálogo público, busca e categorias, página de produto, carrinho com um tipo de produto por pedido, kits específicos por oferta, FAQ em formato de conversa, suporte WhatsApp e telas de conta. Sem dependências ou etapa de build.

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
- Resina Extreme: fotos fornecidas, descrição baseada no rótulo e seis kits de 1 a 6 unidades.
- Galeria com rolagem por toque, miniaturas e navegação por teclado; vídeo do fornecedor carregado somente ao abrir a seção de demonstração.
- Vídeo otimizado para celular, com controles, sem reprodução automática e com descrição visual adjacente. O áudio original foi preservado; legendas de fala ainda dependem de uma transcrição conferida.
- Ofertas conferidas nos links enviados: R$ 99,99 / 124,99 / 147,00 / 197,00 / 180,00 / 210,00. Uma unidade no link enviado custa R$ 99,99, embora o texto inicial mencionasse R$ 89,99. Os links originais de afiliado estão preservados.
- Carrinho salva apenas produto e oferta no navegador. A finalização encaminha ao checkout externo da Logzz; dados de entrega, cobertura, custos e pagamento são confirmados lá.
- Login, cadastro e recuperação têm estrutura visual com campos e envios desabilitados. Não há coleta de senhas.
- Ajuda utiliza respostas cadastradas e WhatsApp +55 81 99688-1704. Não há API de IA, pixel, analytics ou backend.
- O vídeo é identificado como material do fornecedor, sem depoimentos, avaliações ou números de vendas inventados.
- Textos de privacidade, termos e trocas descrevem o funcionamento atual. Identificação definitiva da loja e revisão das condições da operação continuam pendentes.

## Próxima etapa: operação real e Supabase
Conectar autenticação apenas após configurar o projeto real, confirmação de e-mail, recuperação de senha, redirecionamentos permitidos, regras de acesso/RLS para os dados de cada usuário, proteção contra abuso e separação de consentimentos. Usar somente chave publicável no cliente; nunca `service_role`. Não armazenar senhas manualmente. Definir previamente os dados mínimos de pedidos e seus responsáveis.

Publicar identificação verdadeira da loja e dos responsáveis pelas ofertas, conteúdo do produto, estoque/cobertura, prazos, possíveis custos de entrega, meios aceitos e condições de atendimento. Revisar as políticas definitivas conforme a operação real. O pagamento na entrega evita pagamento antecipado; não garante ausência de golpes nem autoriza prometer isso.

Novos produtos reais devem usar `demo: false` e ofertas conferidas; `demoMode: false` já permite o checkout externo deste produto. A indexação continua bloqueada em `robots.txt` e na meta `robots` até concluir os dados e condições da loja. A CSP bloqueia conexões nesta versão (`connect-src 'none'`); revise com os domínios exatos necessários ao Supabase, sem liberar indiscriminadamente. Nunca desabilitar a proteção apenas para fazer a integração funcionar.

## Imagens, vídeo e fontes
Material atual e conferência das ofertas: `assets/resina/SOURCE.md`.

Imagem conceitual produzida com a ferramenta integrada de geração de imagens. Prompt final: fotografia de estúdio para catálogo de uma única escova facial oval de silicone coral, sem marca, cerdas detalhadas e botão discreto, fundo pêssego, luz natural suave pela esquerda e sombra pela direita, composição quadrada centralizada, sem textos ou acessórios. Arquivo: `assets/escova-demo.webp`.

Prompt completo e origem registrados em `assets/IMAGE_SOURCE.txt`. Fontes URW Gothic e Nimbus Sans servidas localmente. Licenças e avisos em `assets/fonts/LICENSE.txt`.

## Verificação
A entrega inclui validação de sintaxe JavaScript, caminhos dos arquivos, regras centrais do carrinho, links de checkout e bloqueio de produtos de demonstração. Capturas e testes em navegador não foram realizados neste ambiente; revise no Netlify em celular e desktop antes de abrir as vendas.
