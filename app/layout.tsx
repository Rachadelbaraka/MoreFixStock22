import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import { AuthProvider } from "@/contexts/auth-context"
import { Toaster } from "@/components/ui/toaster"

export const metadata: Metadata = {
  title: "MoreFix - Produits High-Tech Reconditionnés | Saint-Étienne",
  description:
    "Découvrez notre sélection de produits high-tech reconditionnés et neufs chez MoreFix à Saint-Étienne. Ordinateurs, smartphones, accessoires - Qualité garantie.",
  keywords: "MoreFix, informatique, reconditionné, Saint-Étienne, ordinateurs, smartphones, high-tech",
  authors: [{ name: "Mohammad Radwan" }],
  creator: "Mohammad Radwan",
  publisher: "MoreFix",
  generator: "v0.dev",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fr">
      <body>
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  )
}
