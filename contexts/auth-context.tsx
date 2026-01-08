"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  type User as FirebaseUser,
} from "firebase/auth"
import { doc, setDoc, getDoc, updateDoc } from "firebase/firestore"
import { auth, db } from "@/lib/firebase"
import type { User, AuthContextType, ProfessionalRegistrationData, ClientRegistrationData } from "@/types/auth"
import { cleanWhatsApp } from "@/lib/utils/whatsapp"
import { calculateTrialEndDate } from "@/lib/utils/trial"

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        await loadUserData(firebaseUser)
      } else {
        setUser(null)
      }
      setLoading(false)
    })

    return unsubscribe
  }, [])

  useEffect(() => {
    if (user && !loading) {
      const redirectUrl = sessionStorage.getItem("redirectAfterLogin")
      if (redirectUrl) {
        sessionStorage.removeItem("redirectAfterLogin")
        window.location.href = redirectUrl
      }
    }
  }, [user, loading])

  async function loadUserData(firebaseUser: FirebaseUser) {
    try {
      const userDoc = await getDoc(doc(db, "users", firebaseUser.uid))
      if (userDoc.exists()) {
        const userData = userDoc.data()

        let subscriptionStatus = userData.subscriptionStatus
        let trialData = userData.trial

        const subscriptionData = userData.subscription
          ? {
              active: userData.subscription.active,
              stripeCustomerId: userData.subscription.stripeCustomerId,
              stripeSubscriptionId: userData.subscription.stripeSubscriptionId,
              plan: userData.subscription.plan,
              startedAt: userData.subscription.startedAt?.toDate() || new Date(),
              cancelAtPeriodEnd: userData.subscription.cancelAtPeriodEnd || false,
            }
          : undefined

        if (userData.role === "professional" && userData.trial) {
          const now = new Date()
          const endsAt = userData.trial.endsAt?.toDate()

          // If trial expired, update status to free (only if not premium subscriber)
          if (userData.trial.active && endsAt && now >= endsAt && subscriptionStatus !== "premium") {
            subscriptionStatus = "free"
            trialData = {
              ...userData.trial,
              active: false,
            }

            // Update Firestore
            const userRef = doc(db, "users", firebaseUser.uid)
            await updateDoc(userRef, {
              subscriptionStatus: "free",
              "trial.active": false,
            })
          }
        }

        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email || "",
          whatsapp: userData.whatsapp || "",
          role: userData.role || "client",
          name: userData.name || "",
          businessName: userData.businessName,
          businessType: userData.businessType,
          createdAt: userData.createdAt?.toDate() || new Date(),
          subscriptionStatus: subscriptionStatus || undefined,
          trial: trialData
            ? {
                active: trialData.active,
                startedAt: trialData.startedAt?.toDate() || new Date(),
                endsAt: trialData.endsAt?.toDate() || new Date(),
              }
            : undefined,
          subscription: subscriptionData,
        })
      }
    } catch (error) {
      console.error("Error loading user data:", error)
      setUser(null)
    }
  }

  async function registerProfessional(data: ProfessionalRegistrationData) {
    try {
      const cleanedWhatsApp = cleanWhatsApp(data.whatsapp)

      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password)

      const now = new Date()
      const trialEndsAt = calculateTrialEndDate(now)

      const userData = {
        email: data.email,
        name: data.name,
        whatsapp: cleanedWhatsApp,
        businessName: data.businessName,
        businessType: data.businessType,
        role: "professional" as const,
        createdAt: now,
        subscriptionStatus: "premium_trial" as const,
        trial: {
          active: true,
          startedAt: now,
          endsAt: trialEndsAt,
        },
      }

      await setDoc(doc(db, "users", userCredential.user.uid), userData)

      setUser({
        uid: userCredential.user.uid,
        email: data.email,
        name: data.name,
        whatsapp: cleanedWhatsApp,
        businessName: data.businessName,
        businessType: data.businessType,
        role: "professional",
        createdAt: now,
        subscriptionStatus: "premium_trial",
        trial: {
          active: true,
          startedAt: now,
          endsAt: trialEndsAt,
        },
      })
    } catch (error) {
      console.error("Professional registration error:", error)
      throw error
    }
  }

  async function registerClient(data: ClientRegistrationData) {
    try {
      const cleanedWhatsApp = cleanWhatsApp(data.whatsapp)

      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password)

      const userData = {
        email: data.email,
        name: data.name,
        whatsapp: cleanedWhatsApp,
        role: "client" as const,
        createdAt: new Date(),
      }

      await setDoc(doc(db, "users", userCredential.user.uid), userData)

      setUser({
        uid: userCredential.user.uid,
        email: data.email,
        name: data.name,
        whatsapp: cleanedWhatsApp,
        role: "client",
        createdAt: new Date(),
      })
    } catch (error) {
      console.error("Client registration error:", error)
      throw error
    }
  }

  async function login(email: string, password: string) {
    try {
      await signInWithEmailAndPassword(auth, email, password)
    } catch (error) {
      console.error("Login error:", error)
      throw error
    }
  }

  async function logout() {
    try {
      await signOut(auth)
      setUser(null)
    } catch (error) {
      console.error("Logout error:", error)
      throw error
    }
  }

  async function resetPassword(email: string) {
    try {
      await sendPasswordResetEmail(auth, email)
    } catch (error) {
      console.error("Reset password error:", error)
      throw error
    }
  }

  const value: AuthContextType = {
    user,
    loading,
    login,
    registerProfessional,
    registerClient,
    logout,
    resetPassword,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
