# Chega — loja com pagamento na entrega

Loja afiliada com Resina Extreme, Joelheira de Compressão e Pente Alisador Portátil, com ofertas reais da Logzz. Nome Chega. aprovado, banner natalino rotativo, catálogo público, busca e categorias, página de produto, pedidos individuais por produto, sem carrinho, kits específicos por oferta, FAQ em formato de conversa, suporte WhatsApp e telas de conta. Sem etapa de build: o SDK oficial do Supabase 2.117.2 é servido localmente em `vendor/`, com versão, lockfile, origem e licença registrados.

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
Edite `products.js`. Adicione um objeto na lista `products` para cada produto. Cada produto precisa de um `id` único, nome, categoria, imagem local, resumo, descrição e ofertas verificadas. `images`, `details`, `faq` e `video` são opcionais; cada vídeo deve trazer seu próprio título, descrição e `visualDescription` conferida. Os preços são inteiros em centavos: `9990` representa R$ 99,90. Cada entrada de `offers` corresponde a um kit fixo, com sua própria quantidade, valor e `checkoutUrl` de afiliado. Cadastre somente kits realmente disponíveis. Cada kit abre seu link próprio na Logzz. Não existe carrinho nem soma de produtos diferentes. O catálogo usa toda a largura disponível, três colunas no desktop, duas no tablet e uma no celular, com lotes de 12 produtos e filtros por categoria em círculos com fotos. As categorias são derivadas dos produtos cadastrados, com rolagem horizontal no celular e opção Todos. Cada card abre sua página para escolher o kit.

Preserve o link HTTPS completo de afiliado fornecido para cada oferta, inclusive identificadores e parâmetros. Confira o domínio do parceiro. Não insira senha, segredo, chave privada ou credenciais em nenhum arquivo.

## Estado desta entrega
- Três banners centrados nos produtos: Resina Extreme em verde/dourado, Pente Alisador Portátil em rosa/vinho e Joelheira de Compressão em creme/verde. Composições ilustrativas identificadas, texto e preço em HTML, preço mínimo derivado das ofertas e links para as páginas reais. Sem desconto ou prazo inventado.
- Guirlanda transparente no cabeçalho e rodapé, com espaço reservado e brilho suave. “Pausar efeitos” controla a decoração; movimento reduzido, aba oculta e cenas fora da tela mantêm o efeito estático. Banner e decoração têm controles independentes.
- Banners empilham imagem acima do texto em até 900px; em até 420px os indicadores passam para a segunda linha. Cinco WebPs novos totalizam 241.958 bytes: duas composições 1000×1000, duas variantes móveis 600×600 e guirlanda 1100×367 com transparência.
- Corrigido o transbordamento da foto vertical da Resina nos destaques: círculos com tamanho fixo e imagem contida, rótulos fora da moldura e cards de produto com imagem inteira em moldura quadrada.
- Resina Extreme: fotos fornecidas, descrição baseada no rótulo e seis kits de 1 a 6 unidades.
- Joelheira de Compressão: página própria, imagem principal ilustrativa identificada e duas fotos fornecidas na galeria; kits de 1/2/3/4/6, com preços conferidos de R$ 109,90 / 129,90 / 259,80 / 258,90 / 389,70. Medidas atribuídas ao produtor, sem promessas médicas não comprovadas.
- Pente Alisador Portátil: duas imagens originais fornecidas preservadas na galeria e composição ilustrativa separada para a campanha; kits de 1/2/4 a R$ 129,99 / 199,99 / 359,99. Cores exibidas nas imagens dependem da disponibilidade da oferta.
- Categorias em círculos: Cuidados automotivos, Movimento e bem-estar e Beleza e cuidados; filtro pelo toque, indicação da seleção e opção Todos.
- Galeria com rolagem por toque, miniaturas e navegação por teclado; vídeo do fornecedor carregado somente ao abrir a seção de demonstração.
- Vídeo otimizado para celular, com controles, sem reprodução automática e com descrição visual adjacente. O áudio original foi preservado; legendas de fala ainda dependem de uma transcrição conferida.
- Ofertas conferidas nos links enviados: R$ 99,99 / 124,99 / 147,00 / 197,00 / 180,00 / 210,00. Uma unidade no link enviado custa R$ 99,99, embora o texto inicial mencionasse R$ 89,99. Os links originais de afiliado estão preservados.
- O botão “Pedir” muda para o link exato do kit escolhido e abre o checkout externo da Logzz. Não há carrinho nem seleção persistida. Dados de entrega, cobertura, custos e pagamento são confirmados lá. O carrinho antigo é removido automaticamente.
- Conta, Auth, SMS, CAPTCHA e alterações no Supabase foram explicitamente adiados pelo usuário nesta etapa visual; a integração e seus bloqueios existentes permanecem.
- Supabase Auth integrado: login, cadastro com confirmação de e-mail, recuperação, perfil, preferências, exportação e exclusão de conta. Cadastro e envio de e-mail ficam pausados até a configuração externa descrita abaixo. SMS permanece desativado. Não são coletados CPF ou endereço aqui.
- Ajuda utiliza respostas cadastradas e WhatsApp +55 81 99688-1704. Não há API de IA, pixel ou analytics. O backend é usado somente na área de conta.
- O vídeo é identificado como material do fornecedor, sem depoimentos, avaliações ou números de vendas inventados.
- Textos de privacidade, termos e trocas descrevem o funcionamento atual. Identificação definitiva da loja e revisão das condições da operação continuam pendentes.

## Supabase: configuração aplicada e liberação pendente
Projeto existente: `vsmhkanwhbkkashdjtho`, organização Chega, plano Free. `auth-config.js` contém apenas URL e chave publicável. O SDK oficial está em `vendor/supabase.js`. A sessão usa o armazenamento da aba, e o perfil não guarda senha ou cópias de pedidos.

Foram aplicados os snapshots em `supabase/sql/chega_account_setup.sql` e `chega_account_hardening.sql`. O histórico remoto contém as migrações `chega_private_profiles_and_registration_gate`, `chega_session_and_internal_function_hardening` e `chega_explicit_private_settings_denial`. Não reaplique os snapshots em um projeto já configurado.

`public.chega_profiles` tem RLS, acesso por ID próprio, exigência de e-mail confirmado e sessão ainda existente. O cliente pode atualizar apenas nome, telefone e preferências. Datas/versão de autorização e dono são controlados pelo servidor. Funções privilegiadas ficam no esquema privado, com caminho de busca fixo e permissões restritas. A função interna padrão `public.rls_auto_enable()` teve execução pública revogada sem remover o acionamento interno.

A Edge Function `delete-account` está implantada, com `verify_jwt = true`, validação adicional pelo Auth e perfil, nova confirmação de senha, revogação global de sessões e exclusão em cascata. A chave administrativa existe somente no ambiente da função; não é enviada ao site. O corpo nunca aceita um ID de usuário escolhido pelo cliente.

Antes de liberar cadastros públicos:
1. No Supabase → Authentication → URL Configuration, configurar **Site URL**: `https://cchega.netlify.app/`; **Redirect URLs**: `https://cchega.netlify.app/#conta`. Esse endereço foi informado pelo usuário. Evitar curingas gerais. A configuração no painel ainda não foi verificada.
2. Configurar SMTP de um serviço autorizado. O SMTP padrão do Supabase aceita somente endereços da equipe e até 2 mensagens/hora; não serve para clientes. Manter confirmação de e-mail ativada e troca segura de e-mail. Credenciais SMTP devem ficar no painel, nunca no repositório.
3. Configurar Cloudflare Turnstile no Auth, mantendo a chave secreta somente no painel, e colocar a sitekey pública em `captchaSiteKey`. O widget e o envio de token já estão preparados na criação, login, recuperação, reenvio e confirmação de senha para exclusão. O script do Turnstile só é carregado na área da conta quando houver sitekey configurada. Ajustar a senha mínima no Auth para 12 caracteres e as taxas de envio ao limite do provedor. O mínimo no formulário já é 12; não é uma afirmação sobre a configuração atual do servidor.
4. Publicar nome/razão social verdadeiro do responsável pelo catálogo, canal de atendimento e revisar a política, inclusive hospedagem internacional nos EUA. Um checkbox não garante conformidade jurídica.
5. Validar cadastro → e-mail → login → recuperação → perfil → exclusão com contas de teste autorizadas. Só então ajustar `publicRegistrationEnabled: true` e executar `update chega_private.account_settings set registration_enabled=true where singleton;`.

Não libere só o frontend: o banco bloqueia inserções do Auth enquanto `registration_enabled=false`. O limite inicial é 5000 perfis; isso reduz crescimento, mas não é garantia de que toda cota do plano ou do provedor nunca será atingida.

Telefone é opcional e fica no perfil como informado, sem selo de verificação. Código e telas de SMS ficam disponíveis somente após configurar um provedor e aprovar seus custos. `phoneVerificationEnabled` está `false`; não há envio de SMS ou verificação de CPF. Quando ativado, a confirmação usa `updateUser({phone})` e `verifyOtp` de `phone_change`, com o status vindo do Auth, nunca de um campo editável do perfil.

## Consumo e limites
A organização permaneceu Free, sem novo projeto, branch paga ou serviço pago. Referência consultada: 500 MB de banco, 50 mil usuários ativos mensais, 5 GB de egress e 500 mil invocações de Edge Functions no plano gratuito. Não armazenamos mídia no Supabase, não usamos Realtime nem listamos todas as contas. Cada perfil tem campos limitados; buscas são por chave primária. O banco foi medido em cerca de 11 MB após a configuração, sem usuários persistidos de teste.

Limites e entrega de e-mail/SMS dependem de serviços externos e podem mudar. Acompanhar Usage no painel; o frontend não possui acesso às métricas administrativas nem aciona upgrade automático. Links de documentação: https://supabase.com/pricing ; https://supabase.com/docs/guides/auth/auth-smtp ; https://supabase.com/docs/guides/auth/rate-limits

## Imagens, vídeo e fontes
Origem das imagens, prompt final e conferência das ofertas: `assets/resina/SOURCE.md`, `assets/joelheira/SOURCE.md`, `assets/pente/SOURCE.md` e `assets/campanhas/SOURCE.md`.

Imagem conceitual produzida com a ferramenta integrada de geração de imagens. Prompt final: fotografia de estúdio para catálogo de uma única escova facial oval de silicone coral, sem marca, cerdas detalhadas e botão discreto, fundo pêssego, luz natural suave pela esquerda e sombra pela direita, composição quadrada centralizada, sem textos ou acessórios. Arquivo: `assets/escova-demo.webp`.

Prompt completo e origem registrados em `assets/IMAGE_SOURCE.txt`. Fontes URW Gothic e Nimbus Sans servidas localmente. Licenças e avisos em `assets/fonts/LICENSE.txt`.

## Verificação
Execute `node tests/catalog.test.cjs`, `node tests/auth.test.cjs`, `node tests/banner.test.cjs` e `node tests/seasonal.test.cjs` para testar catálogo, links, conta, rotação e controle de efeitos sem instalar dependências. Os quatro testes passaram nesta entrega. O teste usa 27 produtos: os três reais e 24 entradas sintéticas somente na memória, não na loja publicada.

A entrega inclui validação de sintaxe JavaScript, caminhos dos arquivos, busca/categorias com vários produtos, carregamento em lotes, links de cada kit e ausência de carrinho e bloqueio de produtos de demonstração. A revisão desta etapa foi de código e assets, incluindo os ajustes de empilhamento a 900px e controles a 420px. Capturas e testes em navegador não foram realizados neste ambiente; revise no Netlify em celular e desktop antes de abrir as vendas.

Os testes SQL em `supabase/sql/chega_account_security_test.sql` executaram em transação e rollback, comprovando isolamento, atualização própria, bloqueio de outro dono, imutabilidade do consentimento, acesso anônimo negado, bloqueio de e-mail não confirmado e sessão revogada, trava de cadastro e exclusão em cascata. Nenhum e-mail de teste foi enviado. Entrega de e-mails, CAPTCHA, SMS, UI no navegador e callback de domínio real continuam pendentes de configuração/verificação.

## Ativar CAPTCHA e entrega de confirmações

Cloudflare → Turnstile → Add widget: nome `Chega`, hostname `cchega.netlify.app` (sem protocolo ou caminho), modo `Managed`. O plano gratuito atende este widget; não exige transferir o domínio para Cloudflare. Copiar a **sitekey pública** para `captchaSiteKey` em `auth-config.js`. Copiar a **secret key** somente para Supabase → Authentication → Bot and Abuse Protection → Enable CAPTCHA protection → Turnstile. Nunca enviar a secret key ao frontend ou ao GitHub. Documentação: https://developers.cloudflare.com/turnstile/get-started/widget-management/dashboard/ ; https://developers.cloudflare.com/turnstile/plans/ ; https://supabase.com/docs/guides/auth/auth-captcha

Confirmação por e-mail exige SMTP próprio: remetente autorizado/verificado, host, porta, usuário e senha do provedor configurados no painel Supabase. Confirmação por telefone exige provedor SMS compatível (por exemplo Twilio, Vonage ou MessageBird), com custos externos e limites de envio. Não habilitar SMS nem contratar serviço pago automaticamente. Se CMS significar gerenciamento de conteúdo, trata-se de um painel de produtos separado: o catálogo atual é editado em `products.js`, e não há CMS administrativo implantado.

O banner usa `banner.js`, sem bibliotecas novas ou chamadas ao Supabase. Giro a cada 6,5 segundos, pausa, navegação manual, deslize nativo, respeito a movimento reduzido e encerramento dos temporizadores ao sair da página. `seasonal.js` controla apenas o brilho da guirlanda: pausa manual, visibilidade da aba, IntersectionObserver e movimento reduzido; não grava preferências nem dados de cliente. As imagens novas e seus prompts completos estão documentados em `assets/campanhas/SOURCE.md`.
