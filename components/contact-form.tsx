/**
 * Composant de formulaire de contact
 * Développé par Mohammad Radwan pour MoreFix
 */
"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { toast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"

interface ContactFormProps {
  productId?: number
  productName?: string
  defaultMessage?: string
  onSuccess?: () => void
}

export function ContactForm({ productId, productName, defaultMessage, onSuccess }: ContactFormProps) {
  const { user } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: defaultMessage || "",
    productInfo: productName ? `Produit: ${productName}` : "",
  })

  // Pre-fill with user data when logged in
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.displayName || prev.name,
        email: user.email || prev.email,
      }))
    }
  }, [user])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Replace YOUR_FORMSPREE_ENDPOINT with your actual Formspree endpoint
      const response = await fetch("https://formspree.io/f/xanjpgka", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (response.ok) {
        toast({
          title: "Message envoyé !",
          description: "Votre message a été envoyé avec succès!",
        })

        // Reset form
        setFormData({
          name: "",
          email: "",
          phone: "",
          message: "",
          productInfo: productName ? `Produit: ${productName}` : "",
        })

        // Call onSuccess callback if provided
        if (onSuccess) {
          onSuccess()
        }
      } else {
        toast({
          title: "Erreur",
          description: result.error || "Une erreur est survenue lors de l'envoi du message. Veuillez réessayer.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur inattendue s'est produite. Veuillez réessayer.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Nom *</Label>
          <Input id="name" name="name" required value={formData.name} onChange={handleChange} disabled={isSubmitting} />
        </div>
        <div>
          <Label htmlFor="phone">Téléphone</Label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={handleChange}
            disabled={isSubmitting}
          />
        </div>
      </div>
      <div>
        <Label htmlFor="email">Email *</Label>
        <Input
          id="email"
          name="email"
          type="email"
          required
          value={formData.email}
          onChange={handleChange}
          disabled={isSubmitting}
        />
      </div>
      <div>
        <Label htmlFor="message">Message *</Label>
        <Textarea
          id="message"
          name="message"
          required
          rows={4}
          value={formData.message}
          onChange={handleChange}
          disabled={isSubmitting}
        />
      </div>
      {/* Hidden field for product info */}
      {productName && <input type="hidden" name="productInfo" value={`Produit: ${productName}`} />}

      <Button type="submit" className="w-full bg-gradient-to-r from-orange-500 to-purple-600" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Envoi en cours...
          </>
        ) : (
          "Envoyer le message"
        )}
      </Button>

      {productName && (
        <p className="text-sm text-gray-500 text-center">
          Votre message concerne: <span className="font-medium">{productName}</span>
        </p>
      )}
    </form>
  )
}
