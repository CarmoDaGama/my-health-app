#!/bin/bash

# =================================================================
# GUIA DE EXECUÇÃO RÁPIDA - Sistema Administrativo
# =================================================================
#
# Este script contém todos os comandos necessários para implementar
# o sistema administrativo do Health App Angola.
#
# NÃO EXECUTE ESTE ARQUIVO DIRETAMENTE!
# Copie e cole os comandos conforme necessário.
#
# =================================================================

# =================================================================
# FASE 0: PREPARAÇÃO
# =================================================================

# 1. Backup do projeto
echo "📦 Fazendo backup do projeto..."
cd ~/Projects
tar -czf my-health-app-backup-$(date +%Y%m%d).tar.gz my-health-app/
echo "✅ Backup criado!"

# 2. Verificar versões
echo "🔍 Verificando versões instaladas..."
node --version  # Deve ser v14 ou superior
npm --version
firebase --version

# 3. Fazer login no Firebase
firebase login

# =================================================================
# FASE 1: INICIALIZAR CLOUD FUNCTIONS
# =================================================================

echo "🚀 Fase 1: Inicializando Cloud Functions..."
cd ~/Projects/my-health-app

# Inicializar Functions (se ainda não foi feito)
# Escolher:
# - TypeScript
# - TSLint: Sim
# - Install dependencies: Sim
firebase init functions

# Entrar na pasta functions
cd functions

# Instalar dependências adicionais
echo "📦 Instalando dependências..."
npm install firebase-admin firebase-functions
npm install nodemailer @types/nodemailer
npm install bad-words
npm install moment
npm install --save-dev @types/moment

echo "✅ Dependências instaladas!"

# =================================================================
# FASE 2: CONFIGURAR VARIÁVEIS DE AMBIENTE
# =================================================================

echo "🔧 Configurando variáveis de ambiente..."

# IMPORTANTE: Alterar para seus valores reais
firebase functions:config:set email.user="noreply@healthapp.ao"
firebase functions:config:set email.pass="SUA_SENHA_AQUI"
firebase functions:config:set app.name="Health App Angola"
firebase functions:config:set app.url="https://healthapp.ao"

# Ver configurações atuais
firebase functions:config:get

echo "✅ Variáveis configuradas!"

# =================================================================
# FASE 3: CRIAR ARQUIVOS DE CÓDIGO
# =================================================================

echo "📝 Criando estrutura de arquivos..."

# Criar diretórios
cd ~/Projects/my-health-app/functions/src
mkdir -p utils

# IMPORTANTE: Agora você deve criar os seguintes arquivos manualmente
# ou copiar do PLANO_IMPLEMENTACAO_ADMIN.md:
#
# src/index.ts          - Exportações principais
# src/roles.ts          - Gerenciamento de roles
# src/approval.ts       - Sistema de aprovação
# src/moderation.ts     - Sistema de moderação
# src/analytics.ts      - Dashboard analytics
# src/email.ts          - Serviço de email
# src/utils/validators.ts - Validadores

echo "⚠️  AÇÃO NECESSÁRIA:"
echo "Criar os arquivos TypeScript conforme PLANO_IMPLEMENTACAO_ADMIN.md"
echo ""
read -p "Pressione ENTER quando os arquivos estiverem criados..."

# =================================================================
# FASE 4: COMPILAR E TESTAR
# =================================================================

echo "🔨 Compilando TypeScript..."
cd ~/Projects/my-health-app/functions
npm run build

# Verificar erros
if [ $? -eq 0 ]; then
    echo "✅ Compilação bem-sucedida!"
else
    echo "❌ Erro na compilação. Verifique os arquivos TypeScript."
    exit 1
fi

# =================================================================
# FASE 5: TESTAR LOCALMENTE COM EMULATORS
# =================================================================

echo "🧪 Testando localmente com emulators..."

# Iniciar emulators (em outra janela do terminal)
echo "Abra outro terminal e execute:"
echo "  cd ~/Projects/my-health-app"
echo "  firebase emulators:start"
echo ""
read -p "Pressione ENTER quando os emulators estiverem rodando..."

# Verificar se emulators estão rodando
curl -s http://localhost:4000 > /dev/null
if [ $? -eq 0 ]; then
    echo "✅ Emulators rodando em http://localhost:4000"
else
    echo "❌ Emulators não estão rodando"
    exit 1
fi

# =================================================================
# FASE 6: CRIAR PRIMEIRO SUPER ADMIN
# =================================================================

echo "👤 Criando primeiro super admin..."

# Criar script
cat > ~/Projects/my-health-app/scripts/create-first-admin.js << 'EOF'
const admin = require('firebase-admin');

// IMPORTANTE: Baixar serviceAccountKey.json do Firebase Console
// https://console.firebase.google.com/project/health-app-angola/settings/serviceaccounts/adminsdk
const serviceAccount = require('../serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

async function createFirstSuperAdmin() {
  // ALTERAR ESTAS CREDENCIAIS!
  const email = 'admin@healthapp.ao';
  const password = 'SuperAdmin123!';
  const name = 'Super Administrador';

  try {
    console.log('🔐 Criando primeiro super admin...');
    
    let userRecord;
    try {
      userRecord = await admin.auth().createUser({
        email: email,
        password: password,
        displayName: name,
        emailVerified: true,
      });
    } catch (error) {
      if (error.code === 'auth/email-already-exists') {
        userRecord = await admin.auth().getUserByEmail(email);
      } else {
        throw error;
      }
    }

    await admin.auth().setCustomUserClaims(userRecord.uid, {
      admin: true,
      role: 'super_admin',
      assignedAt: new Date().toISOString(),
    });

    await admin.firestore().collection('users').doc(userRecord.uid).set({
      name: name,
      email: email,
      userType: 'admin',
      role: 'super_admin',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    console.log('\n✅ SUPER ADMIN CRIADO!');
    console.log('Email:', email);
    console.log('Senha:', password);
    console.log('UID:', userRecord.uid);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro:', error);
    process.exit(1);
  }
}

createFirstSuperAdmin();
EOF

echo "✅ Script criado!"
echo ""
echo "⚠️  AÇÃO NECESSÁRIA:"
echo "1. Baixar serviceAccountKey.json do Firebase Console:"
echo "   https://console.firebase.google.com/project/health-app-angola/settings/serviceaccounts/adminsdk"
echo "2. Salvar em: ~/Projects/my-health-app/serviceAccountKey.json"
echo "3. Editar scripts/create-first-admin.js com email/senha desejados"
echo ""
read -p "Pressione ENTER quando estiver pronto para criar o admin..."

# Executar script
node ~/Projects/my-health-app/scripts/create-first-admin.js

# =================================================================
# FASE 7: ATUALIZAR FIRESTORE RULES
# =================================================================

echo "🔐 Atualizando Firestore Rules..."

# Backup das rules atuais
cp ~/Projects/my-health-app/firestore.rules ~/Projects/my-health-app/firestore.rules.old

echo "⚠️  AÇÃO NECESSÁRIA:"
echo "Substituir conteúdo de firestore.rules com as novas rules"
echo "do arquivo PLANO_IMPLEMENTACAO_ADMIN.md"
echo ""
read -p "Pressione ENTER quando as rules estiverem atualizadas..."

# Testar rules localmente
firebase emulators:start --only firestore

# =================================================================
# FASE 8: DEPLOY
# =================================================================

echo "🚀 Fazendo deploy..."

cd ~/Projects/my-health-app

# Deploy apenas das functions (teste)
echo "Deploy das Functions..."
firebase deploy --only functions

# Verificar se deu certo
if [ $? -eq 0 ]; then
    echo "✅ Functions deployadas!"
else
    echo "❌ Erro no deploy das functions"
    exit 1
fi

# Deploy das Firestore Rules
echo "Deploy das Firestore Rules..."
firebase deploy --only firestore:rules

# Deploy completo
echo "Deploy completo..."
firebase deploy

echo "✅ Deploy concluído!"

# =================================================================
# FASE 9: VERIFICAÇÃO PÓS-DEPLOY
# =================================================================

echo "🔍 Verificando deploy..."

# Listar functions deployadas
firebase functions:list

# Ver logs
echo "Últimos logs das functions:"
firebase functions:log --limit 10

# =================================================================
# FASE 10: TESTAR SISTEMA
# =================================================================

echo "🧪 Testando sistema..."

echo ""
echo "TESTES MANUAIS NECESSÁRIOS:"
echo ""
echo "1. Testar Login com Super Admin:"
echo "   - Abrir app/painel admin"
echo "   - Login com credenciais criadas"
echo "   - Verificar que role 'super_admin' está aplicado"
echo ""
echo "2. Testar Criação de Admin:"
echo "   - Chamar função setAdminRole"
echo "   - Verificar custom claims"
echo ""
echo "3. Testar Aprovação de Profissional:"
echo "   - Registrar um profissional no app"
echo "   - Verificar que vai para registeredServices"
echo "   - Aprovar via função approveProfessional"
echo "   - Verificar que moveu para healthServices"
echo ""
echo "4. Testar Moderação:"
echo "   - Criar review"
echo "   - Denunciar review"
echo "   - Listar reviews reportadas"
echo "   - Moderar review"
echo ""
echo "5. Testar Analytics:"
echo "   - Chamar getSystemAnalytics"
echo "   - Verificar dados retornados"
echo ""

# =================================================================
# COMANDOS ÚTEIS PÓS-DEPLOY
# =================================================================

echo ""
echo "=================================================================
"
echo "✅ IMPLEMENTAÇÃO COMPLETA!"
echo "================================================================="
echo ""
echo "📋 COMANDOS ÚTEIS:"
echo ""
echo "# Ver logs em tempo real"
echo "firebase functions:log --tail"
echo ""
echo "# Executar function localmente"
echo "firebase functions:shell"
echo ""
echo "# Abrir console do Firebase"
echo "firefox https://console.firebase.google.com/project/health-app-angola"
echo ""
echo "# Abrir emulator UI"
echo "firefox http://localhost:4000"
echo ""
echo "# Redeployar apenas functions"
echo "cd ~/Projects/my-health-app"
echo "firebase deploy --only functions"
echo ""
echo "# Redeployar apenas rules"
echo "firebase deploy --only firestore:rules"
echo ""
echo "=================================================================
"
echo "📚 DOCUMENTAÇÃO:"
echo "================================================================="
echo ""
echo "- ANALISE_FLUXO_ADMINISTRATIVO.md  - Análise completa"
echo "- PLANO_IMPLEMENTACAO_ADMIN.md     - Código e instruções"
echo "- RESUMO_EXECUTIVO.md              - Resumo em português"
echo ""
echo "=================================================================
"
echo ""
echo "🎉 Pronto para usar!"
echo ""

# =================================================================
# FIM
# =================================================================
