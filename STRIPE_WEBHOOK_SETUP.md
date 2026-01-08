# Configuração do Webhook do Stripe - AgendFy

## Problema Atual
O webhook do Stripe está retornando erro **403 Forbidden**, impedindo que as assinaturas sejam ativadas automaticamente no Firebase após o pagamento.

## Solução: Configurar o Webhook Corretamente

### Passo 1: Acessar o Stripe Dashboard

1. Acesse https://dashboard.stripe.com/
2. No menu lateral, clique em **Developers** > **Webhooks**

### Passo 2: Adicionar Endpoint do Webhook

1. Clique em **Add endpoint** (ou **+ Adicionar endpoint**)
2. No campo **Endpoint URL**, insira:
   ```
   https://v0.app-agendfy.vercel.app/api/stripe-webhook
   ```
   
   **IMPORTANTE**: Certifique-se de que a URL está correta:
   - Use o domínio de produção da sua aplicação
   - O caminho DEVE ser `/api/stripe-webhook` (exatamente como está)
   - Não use `/api/stripe/webhook` ou outras variações

### Passo 3: Selecionar Eventos

Selecione os seguintes eventos para ouvir:

- ✅ `checkout.session.completed` - Quando o checkout é finalizado
- ✅ `invoice.payment_succeeded` - Quando um pagamento é bem-sucedido
- ✅ `customer.subscription.updated` - Quando uma assinatura é atualizada
- ✅ `customer.subscription.deleted` - Quando uma assinatura é cancelada

### Passo 4: Obter o Signing Secret

1. Após criar o endpoint, clique nele para ver os detalhes
2. Na seção **Signing secret**, clique em **Reveal** (Revelar)
3. Copie o valor que começa com `whsec_...`

### Passo 5: Atualizar a Variável de Ambiente

1. Acesse o **Vercel Dashboard** do seu projeto AgendFy
2. Vá em **Settings** > **Environment Variables**
3. Encontre a variável `STRIPE_WEBHOOK_SECRET`
4. Atualize o valor com o signing secret copiado (`whsec_...`)
5. Clique em **Save**
6. **IMPORTANTE**: Faça um novo deploy ou vá em **Deployments** > **Redeploy** para aplicar a mudança

### Passo 6: Testar o Webhook

#### Opção 1: Teste pela Interface do Stripe

1. No Stripe Dashboard, vá até o webhook que você criou
2. Clique na aba **Testing**
3. Selecione o evento `checkout.session.completed`
4. Clique em **Send test webhook**
5. Verifique se retorna **200 OK** (sucesso)

#### Opção 2: Teste com Endpoint de Diagnóstico

Acesse no navegador:
```
https://v0.app-agendfy.vercel.app/api/stripe-webhook/test
```

Você deve ver uma resposta JSON indicando se o webhook secret está configurado.

### Passo 7: Testar com Pagamento Real

1. Faça logout e login novamente na aplicação
2. Tente assinar o Premium novamente
3. Use um cartão de teste do Stripe:
   - Número: `4242 4242 4242 4242`
   - Data: qualquer data futura
   - CVV: qualquer 3 dígitos
   - CEP: qualquer CEP válido

4. Após o pagamento, verifique:
   - ✅ No Stripe: Webhook mostra status **200 OK** (não 403)
   - ✅ No Firebase: Campo `subscriptionStatus` mudou para `"premium"`
   - ✅ No AgendFy: Dashboard mostra **Plano Premium**

## Troubleshooting

### Webhook ainda retorna 403

**Causas comuns:**
- URL do webhook incorreta (verifique se é exatamente `/api/stripe-webhook`)
- Webhook secret desatualizado (certifique-se de copiar o secret correto)
- Variável de ambiente não aplicada (faça redeploy no Vercel)

**Solução:**
1. Delete o webhook antigo no Stripe
2. Crie um novo webhook seguindo todos os passos acima
3. Certifique-se de atualizar o `STRIPE_WEBHOOK_SECRET` no Vercel
4. Faça redeploy da aplicação

### Pagamento aprovado mas assinatura não ativa

**Verificações:**
1. Acesse o Stripe Dashboard > Webhooks
2. Clique no seu webhook
3. Veja a aba **Logs** ou **Recent deliveries**
4. Se houver erro, copie a mensagem e verifique os logs

### Webhook recebe 200 OK mas Firebase não atualiza

**Verificações:**
1. Verifique se o `professionalId` está sendo passado corretamente no metadata
2. Verifique os logs do Vercel (https://vercel.com/seu-projeto/logs)
3. Procure por logs que começam com `[v0]`

## URLs Importantes

- **Webhook URL**: `https://v0.app-agendfy.vercel.app/api/stripe-webhook`
- **Teste do Webhook**: `https://v0.app-agendfy.vercel.app/api/stripe-webhook/test`
- **Stripe Dashboard**: https://dashboard.stripe.com/
- **Vercel Dashboard**: https://vercel.com/

## Suporte

Se o problema persistir após seguir todos os passos:
1. Verifique os logs no Vercel
2. Verifique os logs no Stripe Dashboard > Webhooks > Logs
3. Entre em contato com o suporte técnico em: appagendfy@gmail.com
