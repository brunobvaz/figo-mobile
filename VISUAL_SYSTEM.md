# Sistema visual da Figo

## Base partilhada

- Fundo creme (`background`), cartões brancos (`surface`), borda suave (`borderSubtle`).
- Roxo escuro para títulos de ecrã, ações e seleção; lilás suave (`surfaceSoft`) em pequenos destaques.
- Estados mantêm texto/ícone além da cor. Informação de época usa verde suave.
- Títulos de ecrã de 28, secções de 20, texto principal de 16 e informação auxiliar de 13–15 pontos. Respeitar a escala de letra do dispositivo.
- Controlos interativos com pelo menos 44 pontos; campos e botões principais com altura mínima de 52 e espaço para crescer com o texto.
- Ionicons nos controlos de navegação, produtos e formulários.

## Disposição

`Screen` respeita o cabeçalho nativo, a área segura e a folga da barra inferior. O conteúdo tem largura máxima de 1200; formulários limitam-se a 640 e perfis mantêm os seus limites próprios. A barra inferior centra-se no tablet com largura máxima de 640.

`productGridLayout` calcula de uma a quatro colunas conforme a largura útil e a escala da letra nas listas de exploração. As fotografias dos cartões verticais usam proporção 4:3.

`ProductCard` apresenta nome (até duas linhas, livre com letra ampliada), preço/unidade, localização resumida e vendedor quando necessário. O detalhe do produto mantém a localização completa. O perfil público usa `showSeller={false}` para evitar repetir o autor em cada anúncio. Favoritos são um controlo separado do acesso ao produto.

### Página inicial

- Categorias em seis blocos creme com emojis; com letra ampliada, a faixa permite deslocação horizontal.
- Secções arredondadas: destaques em amarelo (`#FFEA99`), proximidade em lilás (`#EDE9FE`), época em verde (`#D1FAE5`) e vendedores em rosa (`#FCE7F3`).
- Carrosséis horizontais no telefone e tablet, mesmo com um só resultado. Os cartões crescem com a escala de letra.
- Destaques com faixa diagonal «Em destaque», localidade e vendedor; próximos com distância/localidade; sazonais com selo «Da época» e preço. Nomes numa linha, livres com letra ampliada.
- Vendedores mantêm avaliações e vendas reais. Receitas e eventos usam blocos lilás/pêssego e ícones MaterialCommunityIcons.

## Formulários e resposta às ações

- Venda: Fotografias → Informação do produto → Preço → Localização.
- A fotografia principal tem maior destaque; as restantes permitem escolher outra capa.
- Erros locais surgem junto dos campos e o formulário desloca-se para a primeira secção inválida.
- `FeedbackProvider` apresenta confirmações de perfil/fotografia/anúncio, com anúncio acessível e opção de fechar.
- O primeiro carregamento das listas usa `ListSkeleton`; atualizações conservam os dados visíveis.
- `EmptyState` aceita ícone, título, mensagem e ação, como «Explorar produtos» ou «Publicar anúncio».

## Verificação

- `backend/tests/visualLayoutClient.test.js`: larguras de telefone/tablet e escala da letra.
- `npm test` no backend: testes de regressão existentes e da disposição.
- Exportar bundles com Expo para iOS e Android.
- Verificação visual: Início, Explorar, Vender, perfis e favoritos em iPhone/iPad; conferir também leitor de ecrã, letra ampliada e rede lenta em dispositivo.

Esta atualização não precisa de novas dependências nem de migração de dados.
