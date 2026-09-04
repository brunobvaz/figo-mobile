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
