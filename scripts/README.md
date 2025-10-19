# 🔧 Scripts Administrativos

Scripts auxiliares para gerenciamento do Firebase e configuração inicial do sistema.

## 📋 Scripts Disponíveis

### set-super-admin.js

Script para configurar o primeiro Super Admin do sistema.

**Pré-requisitos:**
1. Service Account Key do Firebase
2. Node.js instalado
3. Firebase Admin SDK (`npm install firebase-admin`)

**Como obter Service Account Key:**
1. Acesse [Firebase Console](https://console.firebase.google.com)
2. Vá em Project Settings > Service Accounts
3. Clique em "Generate New Private Key"
4. Salve como `scripts/serviceAccountKey.json`

⚠️ **IMPORTANTE:** O arquivo `serviceAccountKey.json` NÃO deve ser commitado no Git!

**Uso:**

```bash
# Instalar dependências
npm install firebase-admin

# Definir Super Admin
node scripts/set-super-admin.js set seu-email@exemplo.com

# Listar todos os admins
node scripts/set-super-admin.js list

# Remover admin
node scripts/set-super-admin.js remove email@exemplo.com
```

**Exemplo de saída:**

```
✅ Firebase Admin inicializado

🔍 Buscando usuário: admin@exemplo.com...
✅ Usuário encontrado: abc123def456

⚙️  Definindo Custom Claims...
✅ Custom Claims definidos com sucesso!

📝 Criando documento em adminRoles...
✅ Documento criado com sucesso!

📋 Registrando log...
✅ Log registrado!

==================================================
✨ SUCESSO! ✨
==================================================

👤 Usuário: admin@exemplo.com
🆔 UID: abc123def456
👑 Role: Super Admin

📱 Próximos passos:
1. Faça logout no app
2. Faça login novamente
3. Você verá o botão "Painel Admin"
```

---

## 🗂️ Outros Scripts (Cloud Functions - Legacy)

Estes scripts foram criados para uso com Cloud Functions, mas estão disponíveis para referência:

- `migrate-firebase.js` - Migração de dados
- `test-firebase.sh` - Testes de conexão

**Nota:** Estes scripts requerem Firebase Blaze plan para funcionar.

---

## 🔒 Segurança

**NUNCA commite:**
- `serviceAccountKey.json`
- Qualquer arquivo contendo credenciais
- Tokens de acesso
- Senhas

O arquivo `.gitignore` já está configurado para ignorar estes arquivos.

---

## 📚 Documentação Relacionada

- [CLIENT_SIDE_IMPLEMENTATION.md](../CLIENT_SIDE_IMPLEMENTATION.md)
- [RESUMO_CLIENT_SIDE.md](../RESUMO_CLIENT_SIDE.md)
- [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup)

---

**Health App Angola** - Scripts Administrativos
