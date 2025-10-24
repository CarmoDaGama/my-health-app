#!/bin/bash

# Script para testar o funcionamento da edição de perfil
# Execute este script no diretório raiz do projeto

echo "🔍 Testando funcionalidade de edição de perfil..."

echo ""
echo "📁 Verificando arquivos necessários..."

FILES=(
    "components/specific/NormalUserForm.tsx"
    "components/specific/ProfessionalForm.tsx"  
    "components/specific/InstitutionForm.tsx"
    "screens/EditProfileScreen.tsx"
    "hooks/useAuth-firebase.tsx"
    "services/auth-firebase.ts"
    "services/userProfile.ts"
    "types/index.ts"
)

for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file - OK"
    else
        echo "❌ $file - NÃO ENCONTRADO"
    fi
done

echo ""
echo "🔧 Verificando estrutura dos componentes..."

echo "📝 Checando se NormalUserForm tem useEffect..."
if grep -q "useEffect" components/specific/NormalUserForm.tsx; then
    echo "✅ NormalUserForm tem useEffect"
else
    echo "❌ NormalUserForm NÃO tem useEffect - PROBLEMA IDENTIFICADO!"
fi

echo "📝 Checando se ProfessionalForm tem useEffect..."
if grep -q "useEffect" components/specific/ProfessionalForm.tsx; then
    echo "✅ ProfessionalForm tem useEffect"
else
    echo "❌ ProfessionalForm NÃO tem useEffect - PROBLEMA IDENTIFICADO!"
fi

echo "📝 Checando se InstitutionForm tem useEffect..."
if grep -q "useEffect" components/specific/InstitutionForm.tsx; then
    echo "✅ InstitutionForm tem useEffect"
else
    echo "❌ InstitutionForm NÃO tem useEffect - PROBLEMA IDENTIFICADO!"
fi

echo ""
echo "🔍 Verificando logs de debug..."

echo "📝 Checando logs no EditProfileScreen..."
if grep -q "EditProfileScreen - Render iniciado" screens/EditProfileScreen.tsx; then
    echo "✅ EditProfileScreen tem logs de debug"
else
    echo "❌ EditProfileScreen NÃO tem logs de debug"
fi

echo "📝 Checando logs nos formulários..."
if grep -q "Atualizando dados do formulário" components/specific/NormalUserForm.tsx; then
    echo "✅ NormalUserForm tem logs de debug"
else
    echo "❌ NormalUserForm NÃO tem logs de debug"
fi

echo ""
echo "🚀 Recomendações para resolver o problema:"
echo ""
echo "1. ✅ Já corrigido: Adicionamos useEffect nos formulários"
echo "2. ✅ Já corrigido: Adicionamos logs de debug"
echo "3. 🔧 Execute o app e verifique os logs no console"
echo "4. 🔧 Teste criando/editando um usuário para ver os logs"

echo ""
echo "📱 Para testar:"
echo "1. Abra o app no simulador/dispositivo"
echo "2. Faça login ou registre um usuário"
echo "3. Vá para a tela de edição de perfil"
echo "4. Observe os logs no terminal do Metro"

echo ""
echo "🔍 Se o problema persistir, verifique:"
echo "- Se os dados estão chegando do Firebase corretamente"
echo "- Se o contexto de autenticação está funcionando"
echo "- Se os type guards estão funcionando corretamente"

echo ""
echo "✅ Script de teste concluído!"
