/**
 * MoreFix - Admin Panel Component
 * Developed by Mohammad Radwan
 * © 2025 MoreFix
 */

"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Plus, X, Unlock, LogOut, ShieldAlert } from "lucide-react"
import { addProduct, type Product } from "@/lib/products-store"
import { toast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"

interface AdminPanelProps {
  isAuthenticated: boolean
  onLogout: () => void
  onProductAdded?: () => void
}

const CATEGORIES = ["Stockage", "Ordinateurs", "Audio", "Smartphones"]

export function AdminPanel({ isAuthenticated, onLogout, onProductAdded }: AdminPanelProps) {
  const { user, isAdmin } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  // Form state
  const [title, setTitle] = useState("")
  const [price, setPrice] = useState("")
  const [originalPrice, setOriginalPrice] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState("")
  const [condition, setCondition] = useState<"Neuf" | "Occasion">("Neuf")
  const [images, setImages] = useState<string[]>([])
  const [imageUrl, setImageUrl] = useState("")
  const [features, setFeatures] = useState<string[]>([])
  const [featureInput, setFeatureInput] = useState("")

  const handleAddImage = () => {
    if (imageUrl.trim()) {
      setImages([...images, imageUrl.trim()])
      setImageUrl("")
      toast({
        title: "Image ajoutée",
        description: "L'URL de l'image a été ajoutée à la liste",
      })
    }
  }

  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index))
  }

  const handleAddFeature = () => {
    if (featureInput.trim()) {
      setFeatures([...features, featureInput.trim()])
      setFeatureInput("")
    }
  }

  const handleRemoveFeature = (index: number) => {
    setFeatures(features.filter((_, i) => i !== index))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!title || !price || !description || !category || images.length === 0) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      const product: Omit<Product, "id" | "createdAt"> = {
        title,
        price: Number.parseFloat(price),
        originalPrice: originalPrice ? Number.parseFloat(originalPrice) : undefined,
        description,
        category,
        condition,
        images,
        features: features.length > 0 ? features : undefined,
        rating: 4.5,
        reviews: 0,
        inStock: true,
      }

      addProduct(product)

      toast({
        title: "Produit ajouté",
        description: "Le produit a été ajouté avec succès",
      })

      // Reset form
      setTitle("")
      setPrice("")
      setOriginalPrice("")
      setDescription("")
      setCategory("")
      setCondition("Neuf")
      setImages([])
      setFeatures([])

      // Notify parent to refresh products
      if (onProductAdded) {
        onProductAdded()
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'ajout du produit",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Redirect non-admin users
  if (!isAdmin || !user) {
    return (
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <ShieldAlert className="w-5 h-5" />
            Accès Refusé
          </CardTitle>
          <CardDescription>
            Vous n'avez pas les droits d'administration nécessaires pour accéder à cette section.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 mb-4">
            Seul l'administrateur du site peut accéder au panneau d'administration.
          </p>
          <Button 
            onClick={() => router.push("/")} 
            className="w-full bg-purple-600 hover:bg-purple-700 text-white"
          >
            Retour à l'accueil
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Unlock className="w-6 h-6 text-purple-600" />
            Panneau d'Administration
          </h2>
          <p className="text-sm text-gray-600">Connecté en tant que: {user.email}</p>
        </div>
        <Button variant="outline" onClick={onLogout} className="bg-transparent text-red-600 border-red-200 hover:bg-red-50">
          <LogOut className="w-4 h-4 mr-2" />
          Déconnexion
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ajouter un produit</CardTitle>
          <CardDescription>Remplissez le formulaire pour ajouter un nouveau produit</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">Titre *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Dell Latitude 5400"
                  required
                />
              </div>

              <div>
                <Label htmlFor="category">Catégorie *</Label>
                <Select value={category} onValueChange={setCategory} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez une catégorie" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="price">Prix (€) *</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="249.99"
                  required
                />
              </div>

              <div>
                <Label htmlFor="originalPrice">Prix original (€)</Label>
                <Input
                  id="originalPrice"
                  type="number"
                  step="0.01"
                  value={originalPrice}
                  onChange={(e) => setOriginalPrice(e.target.value)}
                  placeholder="399.99"
                />
              </div>

              <div>
                <Label htmlFor="condition">État</Label>
                <Select value={condition} onValueChange={(v) => setCondition(v as "Neuf" | "Occasion")}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Neuf">Neuf</SelectItem>
                    <SelectItem value="Occasion">Occasion</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Description détaillée du produit..."
                rows={3}
                required
              />
            </div>

            <div>
              <Label>Images (URLs) *</Label>
              <div className="flex gap-2 mb-2">
                <Input
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://example.com/image.jpg ou /images/product.png"
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddImage())}
                />
                <Button type="button" onClick={handleAddImage} variant="outline" className="bg-transparent">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {images.map((img, index) => (
                  <Badge key={index} variant="secondary" className="gap-1">
                    Image {index + 1}
                    <button type="button" onClick={() => handleRemoveImage(index)}>
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <Label>Caractéristiques</Label>
              <div className="flex gap-2 mb-2">
                <Input
                  value={featureInput}
                  onChange={(e) => setFeatureInput(e.target.value)}
                  placeholder="Ex: Intel i5-8365U"
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddFeature())}
                />
                <Button type="button" onClick={handleAddFeature} variant="outline" className="bg-transparent">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {features.map((feature, index) => (
                  <Badge key={index} variant="secondary" className="gap-1">
                    {feature}
                    <button type="button" onClick={() => handleRemoveFeature(index)}>
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-orange-500 to-purple-600 hover:from-orange-600 hover:to-purple-700"
            >
              {loading ? "Ajout en cours..." : "Ajouter le produit"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
