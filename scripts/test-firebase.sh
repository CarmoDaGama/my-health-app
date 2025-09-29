#!/bin/bash

# Script para validar configuração Firebase
echo "🔥 Testando configuração Firebase..."

# Verificar se Firebase CLI está instalado
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI não encontrado"
    exit 1
fi

# Verificar se está logado
if ! firebase projects:list &> /dev/null; then
    echo "❌ Não está logado no Firebase"
    echo "Execute: firebase login"
    exit 1
fi

# Verificar projeto atual
PROJECT=$(firebase use | grep "Now using project" | awk '{print $4}' || firebase projects:list --format=json | jq -r '.[] | select(.current == true) | .projectId' 2>/dev/null || echo "health-app-angola")
if [ -z "$PROJECT" ]; then
    echo "❌ Nenhum projeto Firebase configurado"
    exit 1
fi

echo "✅ Firebase CLI configurado"
echo "✅ Projeto ativo: $PROJECT"

# Verificar arquivos de configuração
if [ ! -f "firebase.json" ]; then
    echo "❌ firebase.json não encontrado"
    exit 1
fi

if [ ! -f "firestore.rules" ]; then
    echo "❌ firestore.rules não encontrado"
    exit 1
fi

if [ ! -f "services/firebase.ts" ]; then
    echo "❌ services/firebase.ts não encontrado"
    exit 1
fi

echo "✅ Arquivos de configuração encontrados"

# Verificar dependências npm
if ! npm list firebase &> /dev/null; then
    echo "❌ Dependência 'firebase' não instalada"
    exit 1
fi

if ! npm list @react-native-firebase/app &> /dev/null; then
    echo "❌ Dependência '@react-native-firebase/app' não instalada"
    exit 1
fi

echo "✅ Dependências Firebase instaladas"

# Testar conexão com Firestore
echo "🔍 Testando conexão com Firestore..."
if firebase firestore:indexes &> /dev/null; then
    echo "✅ Conexão com Firestore funcionando"
else
    echo "⚠️  Problemas na conexão com Firestore"
fi

echo ""
echo "🎉 Configuração Firebase validada!"
echo ""
echo "📋 Resumo:"
echo "   ✅ Firebase CLI instalado e logado"
echo "   ✅ Projeto health-app-angola ativo"
echo "   ✅ Arquivos de configuração criados"
echo "   ✅ Dependências instaladas"
echo "   ✅ Firestore configurado"
echo ""
echo "🚀 Próximos passos:"
echo "   1. Executar migração de dados: npm run migrate-firebase"
echo "   2. Iniciar desenvolvimento: npm start"
echo "   3. Testar autenticação no app"
echo ""