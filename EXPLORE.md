# Explorar

O ecrã mantém os filtros aplicados em `route.params.filters`, conforme `ExploreFilters` em `src/navigation/routes.js`. O Home navega com `navigation.navigate(ROUTES.EXPLORE, { filters })`; cada atalho substitui o objeto inteiro. As edições em Explorar usam `setParams` e mantêm as restantes propriedades. Não existe um segundo store de pesquisa. Os painéis de preço e filtros adicionais usam apenas rascunhos até Aplicar; Fechar descarta-os.

`useExploreProducts` consulta a API com debounce de 300 ms para alterações de texto, paginação, deduplicação e proteção contra respostas antigas. A chave da consulta não inclui `viewMode`, por isso alternar Lista/Mapa mantém os resultados e as páginas carregadas. Ambos recebem a mesma coleção filtrada. As coordenadas e região selecionada persistem ao limpar filtros.

Texto, categoria, preço, unidade, vendedor, disponibilidade e ordenação são aplicados pela API antes de paginar. Sem coordenadas, a pesquisa continua por região e a ordenação efetiva é por data. Um raio omitido significa qualquer distância, incluindo para ordenação por proximidade. Mantém-se a regra existente da API que exclui vendidos nas pesquisas geográficas.

Destaques e sazonalidade usam os metadados opcionais existentes e a seleção temporária partilhada com Home (`homeDiscovery`). São aplicados às páginas carregadas, sem inventar correspondências: a contagem indica produtos carregados enquanto existirem páginas. Carregar mais continua disponível mesmo quando uma página não contém correspondências. TODO: seleção editorial/sazonal do backend e filtros/contagens globais correspondentes. Tipo de entrega não existe no modelo e está reservado no contrato, sem controlo ativo.

O mapa usa `react-native-maps` 1.27.2, Apple Maps no iOS e Google Maps no Android. Os pins usam os centros de freguesia da API de localidades, sem expor coordenadas privadas do produto. Produtos no mesmo ponto são agrupados num pin; ao selecioná-lo, a lista horizontal permite abrir cada produto. Produtos sem localização válida mantêm-se na Lista, com aviso no mapa. Não foi adicionada uma biblioteca de clustering.

## Execução e validação

- É necessário reconstruir development builds após adicionar a dependência nativa; o Expo Go compatível inclui react-native-maps.
- Para mapa Android fora de Expo Go, configurar `GOOGLE_MAPS_ANDROID_API_KEY` no ambiente de build e reconstruir a app. O config plugin recebe a chave, enquanto o runtime recebe apenas um booleano. Sem configuração, apresenta-se um aviso em vez de montar o mapa nativo. Não é necessária chave para Apple Maps no iOS.
- Na web apresenta-se um fallback para a Lista.
- Testes: `cd ../backend && npm test -- tests/exploreClient.test.js tests/locations.test.js`.
- Bundles: `npx expo export --platform ios --platform android`.
- Confirmar em dispositivo: pesquisa/limpeza; Home → categoria/destaques/proximidade; GPS autorizado/negado; preços inválidos; filtros em combinação; alternar vistas após carregar mais; selecionar pin com vários produtos; abrir detalhe/favoritar; scroll e bottom navigation.

Não foram alterados o Home nem a bottom navigation nesta implementação.
