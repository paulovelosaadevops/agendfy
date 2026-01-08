# Guia de Migração - Subscription Status

## Problema
Usuários criados antes da implementação do campo `subscriptionStatus` não possuem esse campo no Firestore.

## Solução Manual (Recomendada)

### Opção 1: Via Firebase Console (Mais Simples)

1. Acesse o [Firebase Console](https://console.firebase.google.com/)
2. Vá em **Firestore Database** > **Data**
3. Abra a coleção `users`
4. Para cada usuário **profissional** que não tem `subscriptionStatus`:
   - Clique no documento do usuário
   - Clique em **+ Add field**
   - Nome do campo: `subscriptionStatus`
   - Tipo: `string`
   - Valor: 
     - Se `trial.active = true` e `trial.endsAt` está no futuro: `premium_trial`
     - Caso contrário: `free`
   - Clique em **Add**

### Opção 2: Recriar o Usuário

Se preferir, você pode simplesmente deletar o usuário antigo e criar um novo:

1. No Firebase Console, vá em **Authentication**
2. Delete o usuário
3. Vá em **Firestore Database** e delete o documento do usuário também
4. Crie uma nova conta no app

## Verificação

Após aplicar a correção, o dashboard deve exibir:
- **Plano atual**: Premium (Trial) ou Gratuito
- **Trial expira em**: Data de expiração (se aplicável)

## Prevenção

Todos os novos usuários criados após esta implementação já terão o campo `subscriptionStatus` automaticamente.
