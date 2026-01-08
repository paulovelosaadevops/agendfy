# AgendFy - Configuração de Autenticação

## 🔥 Configuração do Firebase

### 1. Criar projeto Firebase

1. Acesse [Firebase Console](https://console.firebase.google.com/)
2. Clique em "Adicionar projeto"
3. Siga os passos de criação do projeto

### 2. Ativar Authentication

1. No menu lateral, clique em "Authentication"
2. Clique em "Começar"
3. Em "Métodos de login", ative "Email/Senha"

### 3. Configurar Firestore

1. No menu lateral, clique em "Firestore Database"
2. Clique em "Criar banco de dados"
3. Escolha modo de produção
4. Escolha a localização (recomendado: southamerica-east1)

### 4. Configurar regras de segurança do Firestore

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow write: if request.auth != null && request.auth.uid == userId;
      allow create: if request.auth != null;
    }
  }
}
```

### 5. Obter credenciais

1. No menu lateral, clique no ícone de engrenagem > "Configurações do projeto"
2. Em "Seus aplicativos", clique no ícone da web (</>) para adicionar um app web
3. Registre o app
4. Copie as credenciais do Firebase

### 6. Configurar variáveis de ambiente

Crie um arquivo `.env.local` na raiz do projeto:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=sua_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=seu_projeto.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=seu_projeto_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=seu_projeto.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=seu_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=seu_app_id
```

## 📱 Funcionalidades Implementadas

### ✅ Registro de Usuário
- Formulário com email, WhatsApp (obrigatório), senha e confirmação
- Validação de WhatsApp no formato brasileiro
- Dados salvos no Firestore após registro
- Rota: `/register`

### ✅ Login
- Autenticação com email e senha
- Tratamento de erros do Firebase
- Redirecionamento para dashboard após login
- Rota: `/login`

### ✅ Recuperação de Senha
- Envio de email para reset de senha
- Feedback visual de sucesso
- Rota: `/reset-password`

### ✅ Proteção de Rotas
- HOC `ProtectedRoute` para proteger páginas
- Redirecionamento automático para login se não autenticado
- Loading state durante verificação

### ✅ Persistência de Sessão
- Sessão mantida após reload da página
- AuthContext global gerencia estado do usuário
- Logout funcional

## 🗂️ Estrutura de Dados no Firestore

### Coleção `users`

```typescript
{
  uid: string          // ID do usuário (gerado pelo Firebase Auth)
  email: string        // Email do usuário
  whatsapp: string     // Número de WhatsApp (apenas números)
  createdAt: timestamp // Data de criação da conta
}
```

## 🎯 Rotas Criadas

- `/` - Landing page (pública)
- `/login` - Página de login (pública)
- `/register` - Página de registro (pública)
- `/reset-password` - Recuperação de senha (pública)
- `/dashboard` - Dashboard do usuário (protegida)

## 🔒 Segurança

- Todas as senhas são criptografadas pelo Firebase Auth
- WhatsApp armazenado apenas com números (sem formatação)
- Regras do Firestore garantem que usuários só acessem seus próprios dados
- Validação de email e senha no frontend e backend

## 🚀 Próximos Passos

O sistema de autenticação está completo e pronto para uso. Próximas implementações podem incluir:

- Dashboard funcional com agendamentos
- Perfil de usuário editável
- Sistema de notificações via WhatsApp
- Integração com pagamentos (Stripe)
- Funcionalidades de agendamento

## 📝 Notas Importantes

- O campo WhatsApp é obrigatório no registro
- Formato esperado: (11) 96610-7578
- O sistema aceita apenas números com 11 dígitos (DDD + número)
- Landing page permanece intacta e funcional
