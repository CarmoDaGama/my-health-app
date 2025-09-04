#!/bin/bash

echo "🚀 Método Alternativo: Expo Dev Client"
echo "====================================="
echo ""
echo "Para dispositivos fora da rede, a melhor opção é criar um build de desenvolvimento:"
echo ""

# Verificar se eas-cli está instalado
if ! command -v eas &> /dev/null; then
    echo "📦 Instalando EAS CLI..."
    npm install -g eas-cli
fi

echo "🔑 Faça login no Expo (crie conta gratuita se necessário):"
npx expo login

echo ""
echo "📱 Criando build de desenvolvimento..."
echo "💡 Isso criará um APK que pode ser instalado diretamente no celular"
echo ""

# Criar configuração EAS se não existir
if [ ! -f "eas.json" ]; then
    echo "⚙️ Criando configuração EAS..."
    cat > eas.json << EOF
{
  "cli": {
    "version": ">= 8.0.0"
  },
  "build": {
    "development": {
      "distribution": "internal",
      "android": {
        "gradleCommand": ":app:assembleDebug"
      },
      "ios": {
        "buildConfiguration": "Debug"
      }
    },
    "preview": {
      "distribution": "internal"
    },
    "production": {}
  },
  "submit": {
    "production": {}
  }
}
EOF
fi

echo ""
echo "📋 Escolha a plataforma:"
echo "1) Android (APK)"
echo "2) iOS (TestFlight)"
echo "3) Ambos"
echo ""

read -p "Digite sua escolha (1-3): " platform

case $platform in
    1)
        echo "🤖 Criando build para Android..."
        eas build --profile development --platform android
        ;;
    2)
        echo "🍎 Criando build para iOS..."
        eas build --profile development --platform ios
        ;;
    3)
        echo "📱 Criando build para ambas plataformas..."
        eas build --profile development --platform all
        ;;
    *)
        echo "❌ Opção inválida"
        exit 1
        ;;
esac

echo ""
echo "✅ Build criado! Você receberá um link para download."
echo "📲 Instale o APK no seu celular e execute o app."
echo "🔗 O app se conectará automaticamente ao seu servidor de desenvolvimento."
