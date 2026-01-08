// Script para adicionar subscriptionStatus aos usuários existentes
// Este script deve ser executado uma vez para migrar dados antigos

import { initializeApp, getApps, cert } from "firebase-admin/app"
import { getFirestore } from "firebase-admin/firestore"

// Inicializa o Firebase Admin (você precisa configurar as credenciais)
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  })
}

const db = getFirestore()

async function migrateSubscriptionStatus() {
  console.log("🚀 Iniciando migração de subscriptionStatus...")

  try {
    const usersSnapshot = await db.collection("users").get()
    let updatedCount = 0
    let skippedCount = 0

    for (const userDoc of usersSnapshot.docs) {
      const userData = userDoc.data()

      // Se já tem subscriptionStatus, pula
      if (userData.subscriptionStatus) {
        skippedCount++
        continue
      }

      // Apenas profissionais precisam de subscriptionStatus
      if (userData.role === "professional") {
        let newStatus = "free"

        // Se tem trial ativo, define como premium_trial
        if (userData.trial && userData.trial.active === true) {
          const now = new Date()
          const endsAt = userData.trial.endsAt.toDate()

          if (endsAt > now) {
            newStatus = "premium_trial"
          }
        }

        await db.collection("users").doc(userDoc.id).update({
          subscriptionStatus: newStatus,
        })

        console.log(`✅ Atualizado usuário ${userDoc.id}: ${newStatus}`)
        updatedCount++
      } else {
        skippedCount++
      }
    }

    console.log(`\n✨ Migração concluída!`)
    console.log(`   - ${updatedCount} usuários atualizados`)
    console.log(`   - ${skippedCount} usuários ignorados`)
  } catch (error) {
    console.error("❌ Erro na migração:", error)
  }
}

migrateSubscriptionStatus()
