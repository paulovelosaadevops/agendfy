# Guia de Configuração do Stripe para AgendFy

## 1. Configurar Produto e Preço no Stripe

1. Acesse o [Dashboard do Stripe](https://dashboard.stripe.com/)
2. Vá em **Produtos** → **Adicionar produto**
3. Configure o produto:
   - Nome: `AgendFy Premium`
   - Descrição: `Plano Premium para profissionais`
   - Modelo de preços: **Recorrente**
   - Valor: `R$ 9,90`
   - Frequência: **Mensal**
4. Clique em **Salvar produto**
5. **Copie o Price ID** (começa com `price_...`)

## 2. Configurar Environment Variables

Adicione as seguintes variáveis no painel de **Vars** do v0 ou no arquivo `.env.local`:

```env
# Stripe Keys (modo LIVE)
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...

# Price ID do produto Premium
STRIPE_PRICE_ID=price_...

# Webhook Secret (será configurado no próximo passo)
STRIPE_WEBHOOK_SECRET=whsec_...
```

## 3. Configurar Webhook do Stripe

1. No Dashboard do Stripe, vá em **Developers** → **Webhooks**
2. Clique em **Add endpoint**
3. Configure:
   - **Endpoint URL**: `https://seu-dominio.vercel.app/api/stripe-webhook`
   - **Eventos para ouvir**: Selecione:
     - `checkout.session.completed`
     - `invoice.payment_succeeded`
     - `customer.subscription.deleted`
4. Clique em **Add endpoint**
5. **Copie o Signing secret** (começa com `whsec_...`)
6. Adicione esse valor na variável `STRIPE_WEBHOOK_SECRET`

## 4. Atualizar Regras do Firestore

Certifique-se de que as regras do Firestore permitem o webhook atualizar dados:

```javascript
match /users/{userId} {
  allow read: if isOwner(userId) || isCEO();
  allow create: if isAuthenticated() && request.auth.uid == userId;
  allow update: if isOwner(userId) || isCEO();
  allow delete: if isCEO();
}
```

## 5. Testar o Fluxo

### Teste Local (opcional)

Para testar localmente, use o Stripe CLI:

```bash
stripe listen --forward-to localhost:3000/api/stripe-webhook
```

### Teste em Produção

1. Crie um usuário profissional
2. Aguarde o trial de 3 dias expirar (ou expire manualmente no Firestore)
3. Clique em "Assinar Premium" no banner
4. Complete o pagamento no Stripe Checkout
5. Verifique se o status foi atualizado para "premium" no Firestore

## 6. Monitoramento

- **Dashboard do Stripe**: Acompanhe pagamentos e assinaturas
- **Dashboard CEO no AgendFy**: Veja métricas de MRR e conversão
- **Logs do Webhook**: Verifique em Stripe Dashboard → Developers → Webhooks

## Estrutura de Dados no Firestore

Quando um profissional assina, o documento em `users/{userId}` é atualizado com:

```json
{
  "subscriptionStatus": "premium",
  "subscription": {
    "active": true,
    "stripeCustomerId": "cus_...",
    "stripeSubscriptionId": "sub_...",
    "plan": "premium",
    "startedAt": "2025-01-01T00:00:00.000Z",
    "cancelAtPeriodEnd": false
  },
  "trial": {
    "active": false
  }
}
```

## Troubleshooting

- **Webhook não funciona**: Verifique se o STRIPE_WEBHOOK_SECRET está correto
- **Pagamento não atualiza status**: Verifique os logs do webhook no Stripe Dashboard
- **Banner não aparece**: Confirme que o trial expirou e subscriptionStatus é "free"
- **Erro de permissão**: Verifique as regras do Firestore

## Segurança

- ✅ Chaves secretas apenas no servidor
- ✅ Webhook com verificação de assinatura
- ✅ Metadata do Stripe vinculada ao professionalId
- ✅ Validação de role antes de criar checkout
- ✅ Firestore protegido por regras de segurança
