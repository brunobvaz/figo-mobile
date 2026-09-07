# DaTerra

Starter funcional de um marketplace mobile de proximidade para produtos locais, criado com Expo, React Native e JavaScript puro.

## Funcionalidades incluídas

- autenticação real através da API, com tokens em armazenamento seguro;
- registo em dois passos, confirmação de maioridade e verificação de email por OTP;
- navegação separada para visitantes e utilizadores autenticados;
- tabs de Início, Explorar, Vender, Favoritos e Perfil;
- pesquisa e filtros locais por categoria e distância;
- detalhes de produto e perfil do vendedor;
- criação, edição e remoção de anúncios através da API;
- favoritos persistidos;
- edição de perfil e logout;
- carregamento de fotografia de perfil;
- ecrã demonstrativo de encomendas;
- cliente REST com JWT, rotação automática do refresh token e operações GET, POST, PATCH, PUT e DELETE.

## Requisitos

- Node.js LTS
- npm
- Expo Go ou um simulador iOS/Android

## Criar o projeto base do zero

```bash
npx create-expo-app@latest DaTerra --template blank
cd DaTerra
```

Este repositório já contém o projeto criado. Não é necessário repetir esse passo para o executar.

## Instalação

```bash
npm install
npx expo install react-native-screens react-native-safe-area-context @react-native-async-storage/async-storage expo-secure-store expo-image-picker @expo/vector-icons
npm install @react-navigation/native @react-navigation/native-stack @react-navigation/bottom-tabs
cp .env.example .env
```

## Executar

```bash
npm start
```

Depois usa `i` para iOS, `a` para Android ou lê o QR code com Expo Go. Também podes usar `npm run ios`, `npm run android` ou `npm run web` (para web instala primeiro as dependências sugeridas pelo Expo, se necessário).

## Arquitetura

- `components`: elementos visuais comuns, de layout e de produto;
- `screens`: ecrãs agrupados por domínio;
- `navigation`: decisão de autenticação, stacks e tabs;
- `context`: estado global de autenticação, produtos e favoritos;
- `hooks`: acesso consistente aos contexts;
- `services`: fronteira para autenticação, produtos, encomendas e futura API;
- `storage`: wrapper resiliente de AsyncStorage;
- `data`: catálogo, vendedores e categorias mockados;
- `theme`: cores, espaçamento, tipografia e sombras centralizados;
- `utils` e `config`: regras transversais e configuração por ambiente.

Os providers vivem em `App.js`. O `AppNavigator` seleciona automaticamente o fluxo autenticado. A autenticação usa o backend REST/JWT em `../backend/`; os restantes domínios continuam atrás das suas fronteiras de serviço para migração posterior.

## Dados e comportamentos mockados

- vendedores demonstrativos, distâncias e encomendas continuam locais;
- imagens usam URLs públicas apenas como placeholders;
- “Contactar vendedor” mostra uma mensagem informativa;
- favoritos usam AsyncStorage; access e refresh tokens usam Expo SecureStore; produtos usam MongoDB através da API;
- GPS, mapas, chat, notificações, avaliações, pagamentos e upload não estão implementados.

## Variáveis de ambiente

As variáveis públicas Expo começam por `EXPO_PUBLIC_`. Define `EXPO_PUBLIC_API_BASE_URL=http://localhost:3000/api/v1` para o simulador iOS. Em dispositivo físico, troca `localhost` pelo IP local do computador; no emulador Android usa normalmente `10.0.2.2`.

O esquema `daterra://` está configurado para abrir o ecrã de recuperação através de `daterra://reset-password?token=...`.

## Chat real e teste com duas contas

O chat já não utiliza `mockConversations`. `ChatProvider` mantém as conversas e o total de mensagens não lidas, e é desmontado no logout/troca de conta. O indicador sobre o avatar mostra as não lidas dessa conversa; a tab Conversas mostra o total. O vendedor vê o nome e avatar do comprador, e vice-versa.

Com a app ativa, a lista atualiza a cada 8 segundos e a conversa aberta a cada 4 segundos. O chat recupera mensagens ao regressar à app, permite carregar histórico anterior e só confirma a leitura das mensagens visíveis na conversa em foco. Um envio falhado mostra “Reenviar mensagem” e mantém o identificador para evitar duplicados. Fechar o ecrã descarta os rascunhos locais; mensagens confirmadas ficam no servidor. Push fica para uma fase posterior.

Para testar no Render:

1. Publicar o backend atualizado e gerar/instalar uma nova build mobile com `EXPO_PUBLIC_API_BASE_URL` a apontar para esse backend.
2. Usar duas contas verificadas na mesma base de dados, uma em cada dispositivo. Uma conta deve ter um produto publicado.
3. Na outra conta, abrir o produto e tocar em “Contactar vendedor”. Enviar uma mensagem.
4. Com a app do vendedor ativa, verificar o indicador em Conversas e sobre o avatar. Abrir a conversa e responder.
5. Confirmar a troca nos dois sentidos e o desaparecimento do indicador após visualizar as mensagens. Se houver mensagens antigas fora do ecrã, continuam não lidas até serem apresentadas.
6. Fechar e voltar a abrir a app para verificar a persistência. Experimentar um envio sem rede e o reenvio ao recuperar a ligação.

A atualização do Render não atualiza a build instalada. Ambas as apps devem conter este código para o teste completo. A exportação dos bundles valida a compilação; a interação nativa deve ser confirmada nos dispositivos.

## Ativar push

A app inclui `expo-notifications`, o plugin de configuração, o entitlement APNs no projeto iOS existente e a opção **Perfil → Ativar notificações**. Pedimos a permissão apenas por essa opção. Uma permissão já concedida volta a registar o dispositivo no login e quando a app regressa ao primeiro plano. Alterações do token também são registadas. O chat continua funcional se a permissão for recusada ou o registo falhar.

Preparação obrigatória:

1. **iOS:** no projeto EAS `ab64ac0d-87e9-4ed5-8450-582c85f46a45`, configurar a chave APNs para `com.brunobvaz.daterra.bench` e a equipa `9T837KG949`, através de `eas credentials --platform ios`. A assinatura/provisioning profile deve incluir Push Notifications. Para Xcode, abrir `ios/Figo.xcworkspace`; os Pods já incluem ExpoNotifications. Gerar uma nova build assinada.
2. **Android:** criar/selecionar a aplicação Firebase com o mesmo package, disponibilizar o ficheiro `google-services.json` através da variável `GOOGLE_SERVICES_JSON` (caminho local ou variável de ficheiro no EAS) e carregar as credenciais FCM v1 no EAS. `app.config.js` aplica esse caminho ao gerar o projeto Android. A chave privada da conta de serviço fica no EAS, nunca no bundle.
3. Publicar o backend e ativar `PUSH_ENABLED=true`. Se necessário, definir `EXPO_ACCESS_TOKEN` apenas no servidor.
4. Gerar novas builds; uma atualização apenas JavaScript não instala este módulo nativo. Expo Go e web são ignorados por esta implementação. Para a validação final, usar dispositivos físicos e builds com as credenciais corretas.

Ao tocar numa notificação, a app aguarda a autenticação, verifica se a conta corresponde ao destinatário e consulta a conversa autorizada na API antes de navegar. Notificações de outra conta são ignoradas. Um aviso recebido com essa conversa aberta não mostra banner nem toca som. O contador do ícone é sincronizado com as não lidas quando a app está ativa; sem executar a app, não há sincronização silenciosa entre dispositivos nesta fase.

Teste manual: conta A envia a B; verificar B em primeiro plano noutra página, em segundo plano e com a app fechada. Tocar no aviso deve abrir a conversa certa. Repetir com a conversa já aberta (sem alerta redundante), dois dispositivos da conta B, logout, troca de conta e permissão recusada. Durante indisponibilidade de rede, as mensagens continuam no servidor e o registo de push é repetido ao regressar à app. O logout só conclui após confirmação do backend; se não houver rede, a app pede para repetir, mantendo a sessão local até conseguir desligar a conta. Avisos já entregues ao sistema antes do logout não podem ser retirados do serviço remoto.

Referências: https://docs.expo.dev/versions/v57.0.0/sdk/notifications/ e https://docs.expo.dev/push-notifications/push-notifications-setup/.
