import { initializeApp, getApps, cert, type App } from "firebase-admin/app"
import { getFirestore, type Firestore, FieldValue } from "firebase-admin/firestore"

let adminApp: App | null = null
let adminDb: Firestore | null = null

try {
  if (getApps().length === 0) {
    const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT

    if (!serviceAccount) {
      console.error("[Firebase Admin] ❌ FIREBASE_SERVICE_ACCOUNT not found")
      throw new Error("FIREBASE_SERVICE_ACCOUNT environment variable not configured")
    }

    const credentials = JSON.parse(serviceAccount)

    adminApp = initializeApp({
      credential: cert(credentials),
    })

    console.log("[Firebase Admin] ✅ Successfully initialized with service account")
  } else {
    adminApp = getApps()[0]
    console.log("[Firebase Admin] ✅ Using existing app instance")
  }

  adminDb = getFirestore(adminApp)
} catch (error) {
  console.error("[Firebase Admin] ❌ Failed to initialize:", error)
  throw error
}

export function getAdminDb(): Firestore {
  if (!adminDb) {
    throw new Error("Firebase Admin is not initialized. Check FIREBASE_SERVICE_ACCOUNT environment variable.")
  }
  return adminDb
}

// Export serverTimestamp for Admin SDK
export const serverTimestamp = () => FieldValue.serverTimestamp()

export { adminApp, adminDb }
