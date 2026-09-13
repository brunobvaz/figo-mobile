# Loading na Figo

A app usa Expo 57 / React Native, React Navigation, Context + hooks e serviços
fetch/Expo fetch. Não usa React Query ou SWR. Nenhuma dependência foi adicionada.

## Infraestrutura

- `src/components/common/LoadingIndicator.js`: small (22), medium (40), large (76), mensagem opcional, loading, delay e cor opcionais.
- `src/components/common/LoadingScreen.js`: espera de página centrada, fundo do tema e safe area.
- `src/components/common/Loading.js`: compatibilidade com chamadas anteriores.
- `src/hooks/useDelayedLoading.js` e `src/utils/delayedLoading.js`: apresentação após 250 ms, cancelamento dos timers; nenhuma alteração ao tempo das requests.
- `assets/loading-transparent.png`: derivado recortado/transparente de loading.png, original preservado. PNG não permite animar os traços separadamente; optou-se por rotação, escala e opacidade.

Rotação contínua em 1800 ms, escala 0.96–1.04, opacidade 0.8–1. Reduced motion desativa animação. O tamanho do indicador é reservado antes de aparecer. Botões mantêm as dimensões do conteúdo original e ficam desativados desde o início real da operação.

## Integrações

Button aplica automaticamente o loader a login, registo, OTP, recuperação de password, guardar produto/perfil, upload do avatar e envio/paginação de mensagens.
LoadingIndicator substitui os spinners em Home, Explorar, mapa, seleção de moradas, favoritos/meus anúncios, receitas, eventos e contexto de produto no chat.
Conversas usa o indicador na primeira carga. Detalhe de produto mantém dados em cache durante atualização; conta mantém as listas durante refresh. As ações de estado do produto usam loading inline.
AuthContext distingue restauro inicial da sessão de login/verificação: AppNavigator não desmonta o formulário durante submissão. LoadingScreen é usado no restauro após o splash e no detalhe sem dados.

## Limites e próximos passos

Mantidos o splash de marca e o indicador nativo de pull-to-refresh, que fornece feedback ligado ao gesto. Não foram acrescentados loaders globais a polling, notificações push ou gravações silenciosas de favoritos. Nenhum skeleton preexistente; listas de produtos e conversas são os melhores candidatos futuros. Não foram alterados todos os handlers assíncronos secundários; a integração concentra-se nos fluxos principais e nos indicadores existentes.
Verificar em dispositivo com redução de movimento e em rede lenta. Bundle iOS e sintaxe validados; não houve validação visual interativa em simulador nesta tarefa.
