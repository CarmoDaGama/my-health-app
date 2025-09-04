#!/bin/bash

echo "🌐 Configurando Acesso Remoto para Localizador de Serviços de Saúde"
echo "=================================================================="
echo ""

# Verificar se ngrok está instalado
if ! command -v expo &> /dev/null; then
    echo "❌ Expo CLI não encontrado. Instalando..."
    npm install -g @expo/cli
fi

echo "📋 Escolha uma opção de acesso remoto:"
echo ""
echo "1) 🚇 Túnel Expo (Recomendado - funciona em qualquer rede)"
echo "2) 🏠 LAN (apenas dispositivos na mesma rede WiFi)"
echo "3) 🌍 Web (abrir no navegador)"
echo "4) 📱 Localhost (apenas neste computador)"
echo ""

read -p "Digite sua escolha (1-4): " choice

case $choice in
    1)
        echo ""
        echo "🚇 Iniciando com Túnel Expo..."
        echo "💡 Isso criará uma URL pública que funciona em qualquer lugar"
        echo ""
        npx expo start --tunnel
        ;;
    2)
        echo ""
        echo "🏠 Iniciando em modo LAN..."
        echo "💡 Dispositivos devem estar na mesma rede WiFi"
        echo ""
        npx expo start --lan
        ;;
    3)
        echo ""
        echo "🌍 Iniciando versão Web..."
        echo "💡 Abrirá no navegador"
        echo ""
        npx expo start --web
        ;;
    4)
        echo ""
        echo "📱 Iniciando em Localhost..."
        echo "💡 Apenas para teste local"
        echo ""
        npx expo start --localhost
        ;;
    *)
        echo "❌ Opção inválida. Iniciando modo padrão..."
        npx expo start
        ;;
esac

echo ""
echo "🎯 Instruções:"
echo "1. Instale o app 'Expo Go' no seu celular"
echo "2. Escaneie o QR code que aparecerá"
echo "3. Permita acesso à localização quando solicitado"
echo "4. Teste todas as funcionalidades!"
echo ""
echo "📚 Para mais opções, consulte: ACESSO_REMOTO.md"
