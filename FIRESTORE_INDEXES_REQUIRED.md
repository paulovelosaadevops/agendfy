# Índices do Firestore Necessários

O Firestore precisa de índices compostos para as queries complexas do AgendFy. 

## Como Criar os Índices

**Opção 1: Clicar nos Links de Erro (Recomendado)**

Quando você vê os erros de "requires an index", clique diretamente nos links fornecidos pelo Firebase. Cada link abre automaticamente o console com o índice pré-configurado - basta clicar em "Criar".

**Opção 2: Criar Manualmente**

1. Acesse [Firebase Console](https://console.firebase.google.com/)
2. Selecione seu projeto "app-agendfy"
3. Vá em **Firestore Database** → aba **Indexes**
4. Clique em **Create Index**
5. Configure os índices abaixo:

## Índices Necessários

### Índice 1: Appointments por Professional + Data + StartTime
- **Collection ID**: `appointments`
- **Fields**:
  1. `professionalId` - Ascending
  2. `date` - Ascending
  3. `startTime` - Ascending

### Índice 2: Appointments por Professional + Data (Descending)
- **Collection ID**: `appointments`
- **Fields**:
  1. `professionalId` - Ascending
  2. `date` - Descending

**Tempo de criação**: Cada índice leva 2-5 minutos para ser criado.

**Após criar**: Recarregue o dashboard e os erros desaparecerão.
