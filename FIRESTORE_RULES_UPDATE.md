# Atualização de Regras do Firestore

As regras do Firestore precisam ser atualizadas para permitir acesso às novas coleções.

Copie e cole as regras abaixo no Firebase Console > Firestore Database > Regras:

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    
    // Funções auxiliares
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }
    
    function isCEO() {
      return isAuthenticated() && 
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'ceo';
    }
    
    function isProfessional() {
      return isAuthenticated() && 
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'professional';
    }
    
    // Regras para usuários
    match /users/{userId} {
      allow read: if isOwner(userId) || isCEO();
      allow create: if isAuthenticated() && 
                       request.auth.uid == userId &&
                       request.resource.data.keys().hasAll(['email', 'name', 'whatsapp', 'role', 'createdAt']) &&
                       request.resource.data.role in ['professional', 'client'];
      allow update: if isOwner(userId) && 
                       request.resource.data.role == resource.data.role &&
                       request.resource.data.email == resource.data.email;
      allow delete: if isCEO();
    }
    
    // Regras para serviços (apenas profissionais)
    match /services/{serviceId} {
      allow read: if isAuthenticated();
      allow create: if isProfessional() && request.resource.data.professionalId == request.auth.uid;
      allow update, delete: if isProfessional() && resource.data.professionalId == request.auth.uid;
    }
    
    // Regras para agendamentos
    match /appointments/{appointmentId} {
      allow read: if isAuthenticated() && (
        resource.data.professionalId == request.auth.uid || 
        resource.data.clientId == request.auth.uid ||
        isCEO()
      );
      allow create: if isAuthenticated();
      allow update, delete: if isAuthenticated() && (
        resource.data.professionalId == request.auth.uid ||
        isCEO()
      );
    }
    
    // Regras para clientes (agregados)
    match /clients/{clientId} {
      allow read, write: if isProfessional();
    }
    
    // Regras para configurações de negócio
    match /business/{businessId} {
      allow read, write: if isAuthenticated() && businessId == request.auth.uid;
    }
    
    // Bloqueia acesso a outras coleções
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

**Importante**: Após atualizar as regras, teste novamente o dashboard.
