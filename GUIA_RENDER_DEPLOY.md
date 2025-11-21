# 🚀 MENDLINK - Guia Completo para Deploy no Render

## ✅ Status do Projeto
O projeto **MENDLINK** está configurado e pronto para deployment no Render com compatibilidade total com Expo Go!

## 📋 Próximos Passos para Deploy

### 1. 📤 Push para GitHub
```bash
git push origin master
```

### 2. 🌐 Configurar no Render

1. **Acesse:** https://render.com
2. **Faça login** com sua conta GitHub
3. **Clique em:** "New" → "Web Service"
4. **Conecte seu repositório:** `CarmoDaGama/my-health-app`
5. **Configure as seguintes opções:**

```yaml
Name: mendlink-health-app
Environment: Node
Region: Oregon (US West)
Branch: master
Build Command: npm run render-build
Start Command: node server.js
```

### 3. ⚙️ Variáveis de Ambiente
Adicione no Render Dashboard:

```bash
NODE_ENV=production
EXPO_USE_FAST_REFRESH=false
EXPO_USE_METRO_WORKSPACE_ROOT=true
```

### 4. 🚀 Deploy
- Clique em **"Create Web Service"**
- Aguarde o build (pode demorar 5-10 minutos)
- Anote a URL gerada (ex: `https://mendlink-health-app.onrender.com`)

## 📱 Como Usar com Expo Go

### Método 1: QR Code (Recomendado)
1. Acesse: `https://sua-url.onrender.com/expo-qr`
2. Abra o app **Expo Go** no celular
3. Escaneie o QR Code
4. O app carregará diretamente no Expo Go!

### Método 2: URL Direta
1. Abra o app **Expo Go**
2. Digite: `exp://sua-url.onrender.com`
3. Pressione "Connect"

### Método 3: Navegador Web
1. Acesse: `https://sua-url.onrender.com`
2. Use diretamente no navegador mobile

## 🔗 URLs Importantes

Após o deploy, você terá:

- **🌐 App Web:** `https://sua-url.onrender.com`
- **📱 QR Expo:** `https://sua-url.onrender.com/expo-qr`
- **🔍 Health Check:** `https://sua-url.onrender.com/health`
- **📄 App Info:** `https://sua-url.onrender.com/api/app-info`

## 📲 Instalação do Expo Go

### iOS (iPhone/iPad)
- Abra a **App Store**
- Busque por **"Expo Go"**
- Instale o app oficial da Expo

### Android
- Abra o **Google Play Store**
- Busque por **"Expo Go"**
- Instale o app oficial da Expo

## 🛠️ Scripts Disponíveis

```bash
# Deploy completo para Render
npm run deploy:render

# Exportar para web
npm run export:web

# Build de desenvolvimento local
npm run build:development

# Servidor local de teste
node server.js
```

## 🎯 Funcionalidades Implementadas

### ✅ Compatibilidade Expo Go
- ✅ QR Code automático para acesso
- ✅ URL direta para Expo Go
- ✅ Manifest configurado
- ✅ Assets otimizados

### ✅ Deploy Automático
- ✅ Build script otimizado
- ✅ Servidor Express configurado
- ✅ Variáveis de ambiente
- ✅ Health check endpoints

### ✅ Múltiplos Formatos
- ✅ Versão web responsiva
- ✅ Compatibilidade mobile
- ✅ Development builds (APK)
- ✅ Production builds

## 🐛 Troubleshooting

### Problema: App não carrega no Expo Go
**Solução:**
1. Verifique se a URL está acessível no navegador
2. Teste o endpoint: `/health`
3. Verifique os logs do Render

### Problema: Build falha no Render
**Solução:**
1. Verifique se `package.json` está atualizado
2. Confirme as variáveis de ambiente
3. Veja os logs de build no Render Dashboard

### Problema: QR Code não funciona
**Solução:**
1. Acesse `/expo-qr` diretamente
2. Use a URL manual no Expo Go
3. Teste a versão web primeiro

## 📞 Suporte

Se precisar de ajuda:
1. Consulte os logs do Render
2. Teste localmente com `node server.js`
3. Verifique se todos os arquivos foram commitados

## 🎉 Parabéns!

Seu app **MENDLINK** está configurado para ser acessado via:
- 🌐 **Web Browser** (qualquer dispositivo)
- 📱 **Expo Go** (iOS/Android)
- 📦 **APK Nativo** (Android - via build development)

---

**Próximo passo:** Faça o push para GitHub e configure no Render! 🚀