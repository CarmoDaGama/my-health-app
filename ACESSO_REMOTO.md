# 🌐 Guia para Acesso Remoto - Localizador de Serviços de Saúde

## 📱 Opções para Testar em Dispositivos Fora da Rede

### 1. **🚇 Túnel Expo (Mais Fácil)**

```bash
# Instalar ngrok (se necessário)
sudo npm install -g @expo/ngrok

# Iniciar com túnel
npx expo start --tunnel
```

**Como funciona:**
- Cria um túnel público através dos servidores Expo
- Gera uma URL pública que funciona em qualquer lugar
- QR code funciona em qualquer rede

**Vantagens:**
- ✅ Mais simples
- ✅ Funciona imediatamente
- ✅ Não precisa configurar firewall

**Desvantagens:**
- ⚠️ Pode ser mais lento
- ⚠️ Depende da internet

---

### 2. **🌍 Expo Dev Build + EAS**

```bash
# Instalar EAS CLI
npm install -g eas-cli

# Login no Expo
npx expo login

# Criar build de desenvolvimento
eas build --profile development --platform android
```

**Como funciona:**
- Cria um APK/IPA de desenvolvimento
- Pode ser instalado diretamente no dispositivo
- Conecta ao seu servidor local via internet

---

### 3. **🔗 Ngrok Manual**

```bash
# Instalar ngrok
sudo snap install ngrok

# Expor porta 8081 (Metro bundler)
ngrok http 8081

# Iniciar Expo normalmente
npm start
```

**Como funcionar:**
- Use a URL HTTPS fornecida pelo ngrok
- Configure no Expo Go manualmente

---

### 4. **☁️ Deploy Web (Para Testes Básicos)**

```bash
# Instalar dependências web
npx expo install react-dom react-native-web

# Build para web
npx expo export:web

# Deploy em serviço gratuito (Netlify, Vercel, etc.)
```

---

## 🎯 Recomendação: Usar Túnel Expo

Para desenvolvimento e testes, a opção mais prática é o **túnel Expo**:

### Passo a Passo:

1. **Execute no terminal:**
   ```bash
   cd /home/bwane/Projects/my-health-app
   npx expo start --tunnel
   ```

2. **Aceite a instalação do ngrok** quando perguntado

3. **Aguarde aparecer o QR code com URL tipo:**
   ```
   exp://ab-123.user.exp.direct:80
   ```

4. **No celular:**
   - Instale o **Expo Go**
   - Escaneie o QR code
   - O app carregará independente da rede

### 🔧 Comandos Úteis:

```bash
# Túnel (acesso remoto)
npx expo start --tunnel

# LAN (apenas rede local)
npx expo start --lan

# Localhost (apenas mesmo computador)
npx expo start --localhost

# Web (browser)
npx expo start --web
```

### 📋 Checklist para Acesso Remoto:

- [ ] Expo Go instalado no celular
- [ ] Conta Expo criada (opcional mas recomendado)
- [ ] Internet estável em ambos dispositivos
- [ ] Permissões de câmera liberadas para escanear QR
- [ ] Ngrok instalado e funcionando

### 🆘 Solução de Problemas:

**Erro de túnel:**
```bash
# Limpar cache
npx expo start --clear

# Reinstalar ngrok
sudo npm uninstall -g @expo/ngrok
sudo npm install -g @expo/ngrok
```

**App não carrega:**
- Verifique conexão com internet
- Tente fechar e reabrir Expo Go
- Escaneie QR code novamente

**Lentidão:**
- Use `--lan` se estiver na mesma rede
- Considere fazer build de desenvolvimento

---

## 📞 Teste das Funcionalidades

Após conectar remotamente, teste:

1. **Localização** - Permita acesso ao GPS
2. **Mapa** - Verifique se carrega corretamente
3. **Busca** - Teste filtros de serviços
4. **Ligação** - Teste botão de ligar
5. **Direções** - Teste integração com mapas
6. **Idiomas** - Alterne entre PT/EN
