/**
 * MoreFix - Firebase Auth Context
 * Developed by Mohammad Radwan
 * © 2025 MoreFix
 */

"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { firebaseConfig, ADMIN_EMAIL } from "@/lib/firebase-config"

interface User {
  uid: string
  email: string | null
  displayName: string | null
}

interface AuthContextType {
  user: User | null
  isAdmin: boolean
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  signUp: (email: string, password: string, name: string) => Promise<{ success: boolean; error?: string }>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>
  getWishlist: () => Promise<string[]>
  updateWishlist: (productIds: string[]) => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [firebaseApp, setFirebaseApp] = useState<any>(null)
  const [auth, setAuth] = useState<any>(null)
  const [db, setDb] = useState<any>(null)

  // Initialize Firebase on mount (client-side only)
  useEffect(() => {
    let unsubscribe: (() => void) | undefined

    async function initFirebase() {
      try {
        const { initializeApp, getApps } = await import("firebase/app")
        const { getAuth, onAuthStateChanged } = await import("firebase/auth")
        const { getFirestore } = await import("firebase/firestore")

        const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]
        const authInstance = getAuth(app)
        const dbInstance = getFirestore(app)

        setFirebaseApp(app)
        setAuth(authInstance)
        setDb(dbInstance)

        unsubscribe = onAuthStateChanged(authInstance, (firebaseUser) => {
          if (firebaseUser) {
            const userData: User = {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName,
            }
            setUser(userData)
            setIsAdmin(firebaseUser.email === ADMIN_EMAIL)
          } else {
            setUser(null)
            setIsAdmin(false)
          }
          setLoading(false)
        })
      } catch (error) {
        console.error("Firebase init error:", error)
        setLoading(false)
      }
    }

    initFirebase()

    return () => {
      if (unsubscribe) unsubscribe()
    }
  }, [])

  const signIn = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const { signInWithEmailAndPassword } = await import("firebase/auth")
      await signInWithEmailAndPassword(auth, email, password)
      return { success: true }
    } catch (error: any) {
      let errorMessage = "Une erreur est survenue lors de la connexion"
      if (error.code === "auth/user-not-found") {
        errorMessage = "Aucun compte trouvé avec cet email"
      } else if (error.code === "auth/wrong-password") {
        errorMessage = "Mot de passe incorrect"
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "Email invalide"
      } else if (error.code === "auth/invalid-credential") {
        errorMessage = "Email ou mot de passe incorrect"
      }
      return { success: false, error: errorMessage }
    }
  }

  const signUp = async (email: string, password: string, name: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const { createUserWithEmailAndPassword, updateProfile } = await import("firebase/auth")
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      await updateProfile(userCredential.user, { displayName: name })
      // Update local state with display name
      setUser({
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        displayName: name,
      })
      return { success: true }
    } catch (error: any) {
      let errorMessage = "Une erreur est survenue lors de l'inscription"
      if (error.code === "auth/email-already-in-use") {
        errorMessage = "Un compte existe déjà avec cet email"
      } else if (error.code === "auth/weak-password") {
        errorMessage = "Le mot de passe doit contenir au moins 6 caractères"
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "Email invalide"
      }
      return { success: false, error: errorMessage }
    }
  }

  const signOut = async (): Promise<void> => {
    try {
      const { signOut: firebaseSignOut } = await import("firebase/auth")
      await firebaseSignOut(auth)
    } catch (error) {
      console.error("Sign out error:", error)
    }
  }

  const resetPassword = async (email: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const { sendPasswordResetEmail } = await import("firebase/auth")
      await sendPasswordResetEmail(auth, email)
      return { success: true }
    } catch (error: any) {
      let errorMessage = "Une erreur est survenue"
      if (error.code === "auth/user-not-found") {
        errorMessage = "Aucun compte trouvé avec cet email"
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "Email invalide"
      }
      return { success: false, error: errorMessage }
    }
  }

  const getWishlist = async (): Promise<string[]> => {
    if (!user || !db) return []
    try {
      const { doc, getDoc } = await import("firebase/firestore")
      const wishlistDoc = await getDoc(doc(db, "users", user.uid, "data", "wishlist"))
      if (wishlistDoc.exists()) {
        return wishlistDoc.data().items || []
      }
      return []
    } catch (error) {
      console.error("Error getting wishlist:", error)
      return []
    }
  }

  const updateWishlist = async (productIds: string[]): Promise<void> => {
    if (!user || !db) return
    try {
      const { doc, setDoc } = await import("firebase/firestore")
      await setDoc(doc(db, "users", user.uid, "data", "wishlist"), {
        items: productIds,
        updatedAt: new Date(),
      })
    } catch (error) {
      console.error("Error updating wishlist:", error)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAdmin,
        loading,
        signIn,
        signUp,
        signOut,
        resetPassword,
        getWishlist,
        updateWishlist,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
