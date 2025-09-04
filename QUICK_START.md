# 🌐 GUIA RÁPIDO: Como Usar o App Fora da Rede

## 🎯 Método Mais Simples: Túnel Expo

### Passo 1: Parar o servidor atual
```bash
# Pressione Ctrl+C no terminal onde está rodando npm start
```

### Passo 2: Instalar dependências necessárias
```bash
# No terminal do projeto:
npm install -g @expo/cli @expo/ngrok
```

### Passo 3: Iniciar com túnel
```bash
npx expo start --tunnel
```

### Passo 4: No celular
1. Instale **Expo Go** (Play Store/App Store)
2. Escaneie o QR code que aparece no terminal
3. O app carregará independente da rede!

---

## 🔧 Método Alternativo: ngrok Manual

Se o túnel Expo não funcionar:

### Instalar ngrok:
```bash
# Ubuntu/Debian:
sudo snap install ngrok

# Ou baixar de: https://ngrok.com/download
```

### Usar ngrok:
```bash
# Terminal 1: Iniciar app normalmente
npm start

# Terminal 2: Criar túnel
ngrok http 8081
```

### Configurar no celular:
1. Copie a URL HTTPS do ngrok (ex: https://abc123.ngrok.io)
2. No Expo Go: "Enter URL manually"
3. Cole: exp://abc123.ngrok.io:80

---

## 📱 Método Definitivo: Build Direto

Para uso permanente fora da rede:

```bash
# Executar o script:
./build-remote.sh

# Seguir instruções para criar APK
# Instalar APK diretamente no celular
```

---

## ⚡ Teste Rápido Agora

Execute no terminal:
```bash
./start-remote.sh
```

E escolha a opção 1 (Túnel Expo)!
