#!/bin/bash

# ============================================================
# COMANDOS RÁPIDOS - FASES 1 E 2
# Health App Angola - Sistema Administrativo
# ============================================================

echo "============================================================"
echo "COMANDOS RÁPIDOS - DEPLOY FASES 1 E 2"
echo "============================================================"
echo ""

# ============================================================
# 1. CONFIGURAR EMAIL
# ============================================================
echo "1. CONFIGURAR EMAIL"
echo "-------------------"
echo ""
echo "Gmail (recomendado para testes):"
echo "  firebase functions:config:set email.user=\"seu-email@gmail.com\""
echo "  firebase functions:config:set email.pass=\"app-password\""
echo ""
echo "⚠️  Obter App Password:"
echo "  1. Ativar 2FA: https://myaccount.google.com/security"
echo "  2. Gerar App Password: https://myaccount.google.com/apppasswords"
echo "  3. Usar a senha gerada no comando acima"
echo ""
echo "Verificar configuração:"
echo "  firebase functions:config:get"
echo ""
read -p "Pressione ENTER para continuar..."
echo ""

# ============================================================
# 2. BAIXAR SERVICE ACCOUNT KEY
# ============================================================
echo "2. BAIXAR SERVICE ACCOUNT KEY"
echo "-----------------------------"
echo ""
echo "  1. Abrir: https://console.firebase.google.com/project/health-app-angola/settings/serviceaccounts/adminsdk"
echo "  2. Clicar em 'Generate new private key'"
echo "  3. Salvar como: service-account-key.json"
echo "  4. Mover para: /home/katsuvie/Projects/my-health-app/"
echo ""
read -p "Pressione ENTER quando o arquivo estiver salvo..."
echo ""

# Verificar se arquivo existe
if [ -f "service-account-key.json" ]; then
  echo "✅ service-account-key.json encontrado!"
  
  # Adicionar ao .gitignore
  if ! grep -q "service-account-key.json" .gitignore 2>/dev/null; then
    echo "service-account-key.json" >> .gitignore
    echo "✅ Adicionado ao .gitignore"
  fi
else
  echo "❌ service-account-key.json NÃO encontrado"
  echo "   Por favor, baixe o arquivo antes de continuar"
  exit 1
fi
echo ""

# ============================================================
# 3. COMPILAR
# ============================================================
echo "3. COMPILAR CLOUD FUNCTIONS"
echo "---------------------------"
echo ""
cd functions
npm run build

if [ $? -ne 0 ]; then
  echo ""
  echo "❌ Erro na compilação!"
  exit 1
fi

echo ""
echo "✅ Compilação bem-sucedida!"
echo ""
cd ..

# ============================================================
# 4. DEPLOY
# ============================================================
echo "4. DEPLOY"
echo "---------"
echo ""
echo "Deployando Cloud Functions e Firestore Rules..."
echo ""

firebase deploy --only functions,firestore:rules

if [ $? -ne 0 ]; then
  echo ""
  echo "❌ Erro no deploy!"
  exit 1
fi

echo ""
echo "✅ Deploy bem-sucedido!"
echo ""

# ============================================================
# 5. CRIAR SUPER ADMIN
# ============================================================
echo "5. CRIAR SUPER ADMIN"
echo "--------------------"
echo ""

read -p "Email do super admin: " ADMIN_EMAIL

if [ -z "$ADMIN_EMAIL" ]; then
  echo "❌ Email não pode estar vazio"
  exit 1
fi

read -s -p "Senha (mínimo 6 caracteres): " ADMIN_PASSWORD
echo ""

if [ -z "$ADMIN_PASSWORD" ]; then
  echo "❌ Senha não pode estar vazia"
  exit 1
fi

echo ""
echo "Criando super admin..."
echo ""

node scripts/create-first-admin.js "$ADMIN_EMAIL" "$ADMIN_PASSWORD"

if [ $? -ne 0 ]; then
  echo ""
  echo "❌ Erro ao criar super admin!"
  exit 1
fi

echo ""

# ============================================================
# CONCLUSÃO
# ============================================================
echo "============================================================"
echo "✅ DEPLOY COMPLETO!"
echo "============================================================"
echo ""
echo "Fases deployadas:"
echo "  ✅ Fase 1: Sistema de Roles e Permissões"
echo "  ✅ Fase 2: Aprovação de Profissionais"
echo ""
echo "Cloud Functions disponíveis:"
echo "  • setAdminRole"
echo "  • removeAdminRole"
echo "  • listAdmins"
echo "  • approveProfessional"
echo "  • rejectProfessional"
echo "  • listPendingServices"
echo "  • onNewServiceRegistered (trigger)"
echo ""
echo "Super Admin criado:"
echo "  Email: $ADMIN_EMAIL"
echo "  Role: super_admin"
echo ""
echo "Próximos passos:"
echo "  1. Login no app mobile com super admin"
echo "  2. Atribuir roles para outros admins"
echo "  3. Registrar um profissional de teste"
echo "  4. Verificar email de notificação"
echo "  5. Aprovar via admin panel ou Cloud Function"
echo "  6. Verificar email de aprovação"
echo ""
echo "Links úteis:"
echo "  • Firebase Console: https://console.firebase.google.com/project/health-app-angola"
echo "  • Functions Logs: https://console.firebase.google.com/project/health-app-angola/functions/logs"
echo "  • Firestore: https://console.firebase.google.com/project/health-app-angola/firestore"
echo ""
echo "Documentação:"
echo "  • FASE1_RESUMO_IMPLEMENTACAO.md"
echo "  • FASE2_RESUMO.md"
echo "  • IMPLEMENTACOES_FASES_1_E_2.md"
echo ""
echo "============================================================"
echo "🎉 SISTEMA ADMINISTRATIVO 40% IMPLEMENTADO!"
echo "============================================================"
