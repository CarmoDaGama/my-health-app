#!/bin/bash

# ============================================================
# GUIA RÁPIDO DE DEPLOY - FASE 1
# Sistema de Roles e Permissões
# ============================================================

echo "============================================================"
echo "DEPLOY - FASE 1: Sistema de Roles e Permissões"
echo "Health App Angola - Sistema Administrativo"
echo "============================================================"
echo ""

# Verificar se estamos no diretório correto
if [ ! -f "package.json" ]; then
  echo "❌ ERRO: Execute este script no diretório raiz do projeto"
  echo "   cd /home/katsuvie/Projects/my-health-app"
  exit 1
fi

# Verificar se Firebase Functions existe
if [ ! -d "functions" ]; then
  echo "❌ ERRO: Diretório functions/ não encontrado"
  echo "   Execute primeiro: firebase init functions"
  exit 1
fi

echo "✓ Diretório correto"
echo ""

# ============================================================
# PASSO 1: Compilar Cloud Functions
# ============================================================

echo "============================================================"
echo "PASSO 1: Compilar Cloud Functions"
echo "============================================================"
echo ""

cd functions

echo "Instalando dependências..."
npm install

echo ""
echo "Compilando TypeScript..."
npm run build

if [ $? -ne 0 ]; then
  echo ""
  echo "❌ ERRO: Compilação falhou!"
  echo "   Verifique os erros acima e corrija antes de continuar"
  exit 1
fi

echo ""
echo "✅ Compilação bem-sucedida!"
echo ""

cd ..

# ============================================================
# PASSO 2: Deploy das Cloud Functions
# ============================================================

echo "============================================================"
echo "PASSO 2: Deploy das Cloud Functions"
echo "============================================================"
echo ""
echo "As seguintes funções serão deployadas:"
echo "  • setAdminRole - Atribuir role administrativa"
echo "  • removeAdminRole - Remover role administrativa"
echo "  • listAdmins - Listar todos os administradores"
echo ""

read -p "Deseja continuar com o deploy? (s/n) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[SsYy]$ ]]; then
  echo "Deploy cancelado pelo usuário"
  exit 0
fi

echo ""
echo "Fazendo deploy das Cloud Functions..."
firebase deploy --only functions

if [ $? -ne 0 ]; then
  echo ""
  echo "❌ ERRO: Deploy das Cloud Functions falhou!"
  echo "   Verifique os erros acima"
  exit 1
fi

echo ""
echo "✅ Cloud Functions deployadas com sucesso!"
echo ""

# ============================================================
# PASSO 3: Deploy das Firestore Rules
# ============================================================

echo "============================================================"
echo "PASSO 3: Deploy das Firestore Rules"
echo "============================================================"
echo ""
echo "As regras de segurança serão atualizadas com:"
echo "  • Funções auxiliares (isAdmin, hasRole, etc)"
echo "  • Proteção da coleção adminRoles"
echo "  • Proteção da coleção adminLogs"
echo "  • Proteção da coleção reportedReviews"
echo "  • Regras granulares para healthServices"
echo ""

read -p "Deseja continuar com o deploy das regras? (s/n) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[SsYy]$ ]]; then
  echo "Deploy de regras cancelado"
  echo ""
  echo "⚠️  ATENÇÃO: Cloud Functions deployadas mas regras não!"
  echo "   Deploy as regras posteriormente com:"
  echo "   firebase deploy --only firestore:rules"
  exit 0
fi

echo ""
echo "Fazendo deploy das Firestore Rules..."
firebase deploy --only firestore:rules

if [ $? -ne 0 ]; then
  echo ""
  echo "❌ ERRO: Deploy das Firestore Rules falhou!"
  exit 1
fi

echo ""
echo "✅ Firestore Rules deployadas com sucesso!"
echo ""

# ============================================================
# PASSO 4: Service Account Key
# ============================================================

echo "============================================================"
echo "PASSO 4: Service Account Key"
echo "============================================================"
echo ""

if [ -f "service-account-key.json" ]; then
  echo "✓ service-account-key.json encontrado"
else
  echo "⚠️  service-account-key.json NÃO encontrado"
  echo ""
  echo "Para criar o primeiro super admin, você precisa baixar a chave:"
  echo ""
  echo "1. Vá para Firebase Console:"
  echo "   https://console.firebase.google.com/project/health-app-angola/settings/serviceaccounts/adminsdk"
  echo ""
  echo "2. Clique em 'Generate new private key'"
  echo ""
  echo "3. Salve o arquivo como:"
  echo "   /home/katsuvie/Projects/my-health-app/service-account-key.json"
  echo ""
  echo "4. IMPORTANTE: Adicione ao .gitignore"
  echo "   echo 'service-account-key.json' >> .gitignore"
  echo ""
fi

# Verificar .gitignore
if [ -f ".gitignore" ]; then
  if grep -q "service-account-key.json" .gitignore; then
    echo "✓ service-account-key.json está no .gitignore"
  else
    echo "⚠️  Adicionando service-account-key.json ao .gitignore"
    echo "service-account-key.json" >> .gitignore
    echo "✓ Adicionado ao .gitignore"
  fi
else
  echo "⚠️  .gitignore não encontrado, criando..."
  echo "service-account-key.json" > .gitignore
  echo "✓ .gitignore criado"
fi

echo ""

# ============================================================
# PASSO 5: Criar Primeiro Super Admin
# ============================================================

echo "============================================================"
echo "PASSO 5: Criar Primeiro Super Admin"
echo "============================================================"
echo ""

if [ ! -f "service-account-key.json" ]; then
  echo "❌ ERRO: service-account-key.json não encontrado"
  echo "   Baixe a chave primeiro (instruções acima)"
  echo ""
  echo "Após baixar a chave, execute:"
  echo "  node scripts/create-first-admin.js admin@healthapp.ao SenhaSegura123!"
  echo ""
  exit 0
fi

echo "Service account key encontrada!"
echo ""
echo "Agora vamos criar o primeiro super admin"
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
  echo "❌ ERRO: Falha ao criar super admin"
  exit 1
fi

echo ""

# ============================================================
# CONCLUSÃO
# ============================================================

echo "============================================================"
echo "✅ DEPLOY COMPLETO - FASE 1"
echo "============================================================"
echo ""
echo "O que foi deployado:"
echo "  ✅ Cloud Functions (setAdminRole, removeAdminRole, listAdmins)"
echo "  ✅ Firestore Rules (proteção de coleções administrativas)"
echo "  ✅ Primeiro Super Admin criado"
echo ""
echo "Próximos passos:"
echo ""
echo "1. Testar as Cloud Functions:"
echo "   • Login no app mobile com o super admin"
echo "   • Testar atribuição de roles"
echo "   • Verificar logs em adminLogs collection"
echo ""
echo "2. Verificar Firestore Rules:"
echo "   • Tentar acessar adminRoles sem permissão (deve falhar)"
echo "   • Tentar acessar com super admin (deve funcionar)"
echo ""
echo "3. Preparar Fase 2:"
echo "   • Implementar approval.ts (aprovação de profissionais)"
echo "   • Criar fluxo de notificações por email"
echo ""
echo "Logs e Monitoramento:"
echo "  • Firebase Console: https://console.firebase.google.com/project/health-app-angola/functions/logs"
echo "  • Firestore: https://console.firebase.google.com/project/health-app-angola/firestore"
echo ""
echo "Documentação:"
echo "  • Ver FASE1_IMPLEMENTACAO_COMPLETA.md"
echo "  • Ver FASE1_RESUMO_IMPLEMENTACAO.md"
echo ""
echo "============================================================"
echo "Status: ✅ DEPLOY BEM-SUCEDIDO"
echo "============================================================"
