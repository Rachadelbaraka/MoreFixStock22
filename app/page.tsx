/**
 * MoreFix - Site Vitrine
 * Développé par Mohammad Radwan
 * © 2025 MoreFix
 */
"use client"

import { useState, useMemo, useEffect } from "react"
import {
  Phone,
  Mail,
  Search,
  Heart,
  MessageCircle,
  Grid,
  List,
  X,
  Menu,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Trash2,
  ShieldCheck,
  LogIn,
  LogOut,
  User,
  Loader2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { toast } from "@/hooks/use-toast"
import { ContactForm } from "@/components/contact-form"
import { AdminPanel } from "@/components/admin-panel"
import Image from "next/image"
import Link from "next/link"
import { getProducts, deleteProduct as deleteProductFromStore, type Product } from "@/lib/products-store"
import { useAuth } from "@/contexts/auth-context"

const categories = ["Tous", "Stockage", "Ordinateurs", "Audio", "Smartphones"]

type ViewMode = "grid" | "list"
type SortOption = "price-asc" | "price-desc" | "rating" | "newest"

export default function HomePage() {
  const { user, isAdmin, loading: authLoading, signOut, getWishlist, updateWishlist } = useAuth()
  
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("Tous")
  const [sortBy, setSortBy] = useState<SortOption>("newest")
  const [viewMode, setViewMode] = useState<ViewMode>("grid")
  const [wishlist, setWishlist] = useState<string[]>([])
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [contactProduct, setContactProduct] = useState<Product | null>(null)
  const [contactDialogOpen, setContactDialogOpen] = useState(false)
  const [selectedImageIndex, setSelectedImageIndex] = useState<{ [key: string]: number }>({})
  const [loginPromptOpen, setLoginPromptOpen] = useState(false)

  // Lightbox state
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxProduct, setLightboxProduct] = useState<Product | null>(null)
  const [lightboxImageIndex, setLightboxImageIndex] = useState(0)

  const [products, setProducts] = useState<Product[]>([])
  const [productsLoading, setProductsLoading] = useState(true)

  const [showAdminPanel, setShowAdminPanel] = useState(false)

  const deleteProductFn = deleteProductFromStore

  // Load products on mount
  useEffect(() => {
    setProducts(getProducts())
    setProductsLoading(false)
  }, [])

  // Load wishlist from Firestore when user logs in
  useEffect(() => {
    async function loadWishlist() {
      if (user) {
        const savedWishlist = await getWishlist()
        setWishlist(savedWishlist)
      } else {
        setWishlist([])
      }
    }
    loadWishlist()
  }, [user, getWishlist])

  // Callback to refresh products after admin actions
  const refreshProducts = () => {
    setProducts(getProducts())
  }

  const handleLogout = async () => {
    await signOut()
    setShowAdminPanel(false)
    toast({
      title: "Déconnexion",
      description: "Vous avez été déconnecté avec succès",
    })
  }

  const handleDeleteProduct = (productId: string, productName: string) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer "${productName}" ?`)) {
      return
    }

    const success = deleteProductFromStore(productId)

    if (success) {
      refreshProducts()
      toast({
        title: "Produit supprimé",
        description: `"${productName}" a été supprimé avec succès`,
      })
    } else {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le produit",
        variant: "destructive",
      })
    }
  }

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    const filtered = products.filter((product) => {
      const matchesSearch =
        product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCategory = selectedCategory === "Tous" || product.category === selectedCategory
      return matchesSearch && matchesCategory
    })

    // Sort products
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "price-asc":
          return a.price - b.price
        case "price-desc":
          return b.price - a.price
        case "rating":
          return (b.rating || 0) - (a.rating || 0)
        case "newest":
        default:
          const aTime = new Date(a.createdAt).getTime()
          const bTime = new Date(b.createdAt).getTime()
          return bTime - aTime
      }
    })

    return filtered
  }, [products, searchQuery, selectedCategory, sortBy])

  const toggleWishlist = async (productId: string) => {
    if (!user) {
      toast({
        title: "Connexion requise",
        description: "Veuillez vous connecter pour sauvegarder des favoris",
        variant: "destructive",
      })
      setLoginPromptOpen(true)
      return
    }
    
    const newWishlist = wishlist.includes(productId) 
      ? wishlist.filter((id) => id !== productId) 
      : [...wishlist, productId]
    
    setWishlist(newWishlist)
    await updateWishlist(newWishlist)
    
    toast({
      title: wishlist.includes(productId) ? "Retiré des favoris" : "Ajouté aux favoris",
      description: wishlist.includes(productId)
        ? "Le produit a été retiré de votre liste de souhaits"
        : "Le produit a été ajouté à votre liste de souhaits",
    })
  }

  const scrollToContact = () => {
    document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" })
  }

  const handleContactClick = (product?: Product) => {
    if (!user) {
      setLoginPromptOpen(true)
      return
    }
    if (product) {
      setContactProduct(product)
    }
    setContactDialogOpen(true)
  }

  const openContactModal = (product: Product) => {
    handleContactClick(product)
  }

  const getCurrentImage = (product: Product) => {
    if (!product.images || product.images.length === 0) return "/placeholder.svg"
    const index = selectedImageIndex[product.id] || 0
    return product.images[index]
  }

  const handleImageNavigation = (productId: string, direction: "prev" | "next", totalImages: number) => {
    setSelectedImageIndex((prev) => {
      const currentIndex = prev[productId] || 0
      const newIndex =
        direction === "next" ? (currentIndex + 1) % totalImages : (currentIndex - 1 + totalImages) % totalImages
      return { ...prev, [productId]: newIndex }
    })
  }

  const openLightbox = (product: Product, imageIndex: number) => {
    setLightboxProduct(product)
    setLightboxImageIndex(imageIndex)
    setLightboxOpen(true)
  }

  const closeLightbox = () => {
    setLightboxOpen(false)
    setLightboxProduct(null)
    setLightboxImageIndex(0)
  }

  const navigateLightbox = (direction: "prev" | "next") => {
    if (!lightboxProduct || !lightboxProduct.images) return
    const totalImages = lightboxProduct.images.length
    setLightboxImageIndex((prev) =>
      direction === "next" ? (prev + 1) % totalImages : (prev - 1 + totalImages) % totalImages,
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Image src="/logo.png" alt="MoreFix Logo" width={120} height={40} className="h-10 w-auto" />
            </div>

            {/* Desktop Search */}
            <div className="hidden md:flex items-center space-x-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Rechercher un produit..."
                  className="pl-10 w-80"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Admin Panel Button - Only for admins */}
              {isAdmin && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAdminPanel(!showAdminPanel)}
                  className="hidden md:flex"
                  title="Panneau d'administration"
                >
                  <ShieldCheck className="w-5 h-5 text-purple-600" />
                </Button>
              )}

              {/* Auth Buttons */}
              {authLoading ? (
                <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
              ) : user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-purple-100 text-purple-600 text-sm">
                          {user.displayName?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <span className="hidden md:inline text-sm font-medium">
                        {user.displayName || user.email?.split("@")[0]}
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <div className="px-2 py-1.5 text-sm text-gray-500">
                      {user.email}
                    </div>
                    <DropdownMenuSeparator />
                    {isAdmin && (
                      <>
                        <DropdownMenuItem onClick={() => setShowAdminPanel(!showAdminPanel)}>
                          <ShieldCheck className="w-4 h-4 mr-2" />
                          Administration
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                      </>
                    )}
                    <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                      <LogOut className="w-4 h-4 mr-2" />
                      Se déconnecter
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link href="/login">
                  <Button variant="outline" size="sm" className="flex items-center gap-2">
                    <LogIn className="w-4 h-4" />
                    <span className="hidden md:inline">Se connecter</span>
                  </Button>
                </Link>
              )}

              {/* Wishlist */}
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm" className="relative">
                    <Heart className="w-5 h-5" />
                    {wishlist.length > 0 && (
                      <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                        {wishlist.length}
                      </Badge>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>Mes Favoris</SheetTitle>
                    <SheetDescription>
                      {wishlist.length} produit{wishlist.length !== 1 ? "s" : ""} dans votre liste de souhaits
                    </SheetDescription>
                  </SheetHeader>
                  <div className="mt-6 space-y-4">
                    {wishlist.map((id) => {
                      const product = products.find((p) => p.id === id.toString())
                      if (!product) return null
                      return (
                        <div key={id} className="flex items-center space-x-3 p-3 border rounded-lg">
                          <div className="w-16 h-16 relative overflow-hidden rounded">
                            <Image
                              src={getCurrentImage(product) || "/placeholder.svg"}
                              alt={product.title}
                              fill
                              className="object-contain"
                            />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-sm">{product.title}</h4>
                            <p className="text-purple-600 font-semibold">{product.price}€</p>
                          </div>
                          <Button variant="ghost" size="sm" onClick={() => toggleWishlist(product.id!)}>
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      )
                    })}
                    {wishlist.length === 0 && (
                      <p className="text-gray-500 text-center py-8">Aucun produit dans vos favoris</p>
                    )}
                  </div>
                </SheetContent>
              </Sheet>

              {/* Contact Button - Always Visible */}
              <Button
                onClick={scrollToContact}
                className="bg-gradient-to-r from-orange-500 to-purple-600 hover:from-orange-600 hover:to-purple-700 transition-all duration-300 ease-in-out transform hover:scale-105 shadow-md hover:shadow-lg"
              >
                <Phone className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Nous contacter</span>
                <span className="sm:hidden">Contact</span>
              </Button>

              {/* Mobile Menu */}
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm" className="md:hidden">
                    <Menu className="w-5 h-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left">
                  <SheetHeader>
                    <SheetTitle>Menu</SheetTitle>
                  </SheetHeader>
                  <div className="mt-6 space-y-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        placeholder="Rechercher..."
                        className="pl-10"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      {categories.map((category) => (
                        <Button
                          key={category}
                          variant={category === selectedCategory ? "default" : "ghost"}
                          className="w-full justify-start"
                          onClick={() => {
                            setSelectedCategory(category)
                            setMobileMenuOpen(false)
                          }}
                        >
                          {category}
                        </Button>
                      ))}
                    </div>
                    <div className="pt-4 border-t space-y-2">
                      {/* Mobile Auth */}
                      {user ? (
                        <>
                          <div className="px-2 py-2 text-sm text-gray-600 flex items-center gap-2">
                            <User className="w-4 h-4" />
                            {user.displayName || user.email}
                          </div>
                          {isAdmin && (
                            <Button
                              onClick={() => {
                                setShowAdminPanel(!showAdminPanel)
                                setMobileMenuOpen(false)
                              }}
                              variant="outline"
                              className="w-full"
                            >
                              <ShieldCheck className="w-4 h-4 mr-2" />
                              Administration
                            </Button>
                          )}
                          <Button
                            onClick={() => {
                              handleLogout()
                              setMobileMenuOpen(false)
                            }}
                            variant="outline"
                            className="w-full text-red-600 border-red-200 hover:bg-red-50"
                          >
                            <LogOut className="w-4 h-4 mr-2" />
                            Se déconnecter
                          </Button>
                        </>
                      ) : (
                        <Link href="/login" className="block">
                          <Button variant="outline" className="w-full">
                            <LogIn className="w-4 h-4 mr-2" />
                            Se connecter
                          </Button>
                        </Link>
                      )}
                      <Button
                        onClick={() => {
                          scrollToContact()
                          setMobileMenuOpen(false)
                        }}
                        className="w-full bg-gradient-to-r from-orange-500 to-purple-600 hover:from-orange-600 hover:to-purple-700 transition-all duration-300"
                      >
                        <Phone className="w-4 h-4 mr-2" />
                        Nous contacter
                      </Button>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-orange-400 via-purple-500 to-purple-700 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          {/* Hero Logo - White version */}
          <div className="mb-8 flex justify-center">
            <Image
              src="/logo.png"
              alt="MoreFix Logo"
              width={240}
              height={80}
              className="h-24 w-auto brightness-0 invert"
              priority
            />
          </div>

          <h1 className="text-4xl md:text-6xl font-bold mb-4">Produits High-Tech</h1>
          <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-2xl mx-auto">
            Découvrez notre sélection de produits reconditionnés et neufs à Saint-Étienne
          </p>
          <Button
            size="lg"
            onClick={() => document.getElementById("products")?.scrollIntoView({ behavior: "smooth" })}
            className="bg-white text-purple-700 hover:bg-gray-100 font-semibold text-lg px-8 py-6"
          >
            Découvrir nos produits
          </Button>
        </div>
      </section>

      {showAdminPanel && isAdmin && (
        <section className="py-8 bg-purple-50 border-b">
          <div className="container mx-auto px-4">
            <AdminPanel isAuthenticated={isAdmin} onLogout={handleLogout} onProductAdded={refreshProducts} />
          </div>
        </section>
      )}

      {/* Login Prompt Dialog */}
      <Dialog open={loginPromptOpen} onOpenChange={setLoginPromptOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Connexion requise</DialogTitle>
            <DialogDescription>
              Connectez-vous pour accéder à cette fonctionnalité
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-4">
            <p className="text-sm text-gray-600">
              Pour contacter le vendeur ou sauvegarder des favoris, vous devez être connecté à votre compte.
            </p>
            <div className="flex gap-3">
              <Link href="/login" className="flex-1">
                <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white">
                  Se connecter
                </Button>
              </Link>
              <Link href="/signup" className="flex-1">
                <Button variant="outline" className="w-full">
                  Créer un compte
                </Button>
              </Link>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Products Section */}
      <section className="py-8 bg-white border-b" id="products">
        <div className="container mx-auto px-4">
          {/* Filters and Sort */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={category === selectedCategory ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className={category === selectedCategory ? "bg-purple-600 hover:bg-purple-700" : ""}
                >
                  {category}
                </Button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Trier par" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Plus récent</SelectItem>
                  <SelectItem value="price-asc">Prix croissant</SelectItem>
                  <SelectItem value="price-desc">Prix décroissant</SelectItem>
                  <SelectItem value="rating">Meilleures notes</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex border rounded-md">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className={viewMode === "grid" ? "bg-purple-600" : ""}
                >
                  <Grid className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className={viewMode === "list" ? "bg-purple-600" : ""}
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          <p className="text-gray-600 mb-6">
            {filteredProducts.length} produit{filteredProducts.length !== 1 ? "s" : ""} trouvé
            {filteredProducts.length !== 1 ? "s" : ""}
          </p>

          {/* Products Grid/List */}
          <div>
            {productsLoading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                <p className="mt-4 text-gray-600">Chargement des produits...</p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg mb-4">Aucun produit trouvé</p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery("")
                    setSelectedCategory("Tous")
                  }}
                >
                  Réinitialiser les filtres
                </Button>
              </div>
            ) : (
              <div
                className={
                  viewMode === "grid"
                    ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                    : "space-y-6"
                }
              >
                {filteredProducts.map((product) => (
                  <Card
                    key={product.id}
                    className={`group hover:shadow-xl transition-all duration-300 border-0 shadow-md overflow-hidden ${
                      viewMode === "list" ? "flex flex-row" : ""
                    }`}
                  >
                    <div className={`relative ${viewMode === "list" ? "w-48 flex-shrink-0" : ""}`}>
                      <div className="relative">
                        <div
                          className={`relative overflow-hidden cursor-pointer bg-white ${
                            viewMode === "list" ? "w-full h-full aspect-square" : "w-full h-48"
                          }`}
                          onClick={() => {
                            const currentIndex = selectedImageIndex[product.id!] || 0
                            openLightbox(product, currentIndex)
                          }}
                        >
                          <Image
                            src={getCurrentImage(product) || "/placeholder.svg"}
                            alt={product.title}
                            fill
                            className="object-contain p-2 group-hover:scale-105 transition-transform duration-300"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          />
                        </div>

                        {/* Image navigation for products with gallery */}
                        {product.images && product.images.length > 1 && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white opacity-0 group-hover:opacity-100 transition-opacity z-10"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleImageNavigation(product.id!, "prev", product.images!.length)
                              }}
                            >
                              <ChevronLeft className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white opacity-0 group-hover:opacity-100 transition-opacity z-10"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleImageNavigation(product.id!, "next", product.images!.length)
                              }}
                            >
                              <ChevronRight className="w-4 h-4" />
                            </Button>

                            {/* Image indicators */}
                            <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
                              {product.images.map((_, index) => (
                                <div
                                  key={index}
                                  className={`w-2 h-2 rounded-full ${
                                    index === (selectedImageIndex[product.id!] || 0) ? "bg-purple-600" : "bg-gray-300"
                                  }`}
                                />
                              ))}
                            </div>
                          </>
                        )}
                      </div>

                      <div className="absolute top-3 right-3 flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="bg-white/80 hover:bg-white"
                          onClick={(e) => {
                            e.stopPropagation()
                            toggleWishlist(product.id!)
                          }}
                        >
                          <Heart
                            className={`w-4 h-4 ${wishlist.includes(product.id!) ? "fill-red-500 text-red-500" : ""}`}
                          />
                        </Button>
                        {isAdmin && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="bg-red-500/80 hover:bg-red-600 text-white"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDeleteProduct(product.id!, product.title)
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                      {product.inStock === false && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <Badge variant="destructive" className="text-lg px-4 py-2">
                            Rupture de stock
                          </Badge>
                        </div>
                      )}
                    </div>

                    <div className={viewMode === "list" ? "flex-1" : ""}>
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <Badge variant="outline" className="text-xs">
                            {product.category}
                          </Badge>
                          <div className="rounded-full px-3 py-1 text-xs font-medium text-white bg-gradient-to-r from-orange-500 to-purple-600 shadow-sm">
                            {product.condition}
                          </div>
                        </div>
                        <CardTitle className="text-lg line-clamp-2">{product.title}</CardTitle>
                        <CardDescription className="line-clamp-2">{product.description}</CardDescription>

                        {viewMode === "list" && product.features && (
                          <div className="mt-2">
                            <div className="flex flex-wrap gap-1">
                              {product.features.map((feature, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {feature}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </CardHeader>

                      <CardContent className="pt-0">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-2">
                            <span className="text-2xl font-bold text-purple-600">{product.price}€</span>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            className="flex-1 bg-gradient-to-r from-orange-500 to-purple-600 hover:from-orange-600 hover:to-purple-700 text-white"
                            disabled={product.inStock === false}
                            onClick={() => openContactModal(product)}
                          >
                            {user ? (
                              <>
                                <MessageCircle className="w-4 h-4 mr-2" />
                                Contacter
                              </>
                            ) : (
                              <>
                                <LogIn className="w-4 h-4 mr-2" />
                                Connectez-vous
                              </>
                            )}
                          </Button>

                          <Button
                            variant="outline"
                            size="sm"
                            disabled={product.inStock === false}
                            onClick={() => toggleWishlist(product.id!)}
                          >
                            <Heart
                              className={`w-4 h-4 ${wishlist.includes(product.id!) ? "fill-red-500 text-red-500" : ""}`}
                            />
                          </Button>
                        </div>
                      </CardContent>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Lightbox Dialog */}
      <Dialog open={lightboxOpen} onOpenChange={closeLightbox}>
        <DialogContent className="max-w-4xl p-0">
          {lightboxProduct && lightboxProduct.images && (
            <div className="relative">
              <div className="relative w-full h-[70vh] bg-black">
                <Image
                  src={lightboxProduct.images[lightboxImageIndex] || "/placeholder.svg"}
                  alt={`${lightboxProduct.title} - Image ${lightboxImageIndex + 1}`}
                  fill
                  className="object-contain"
                  sizes="(max-width: 1024px) 100vw, 1024px"
                />
              </div>

              {lightboxProduct.images.length > 1 && (
                <>
                  <Button
                    variant="ghost"
                    size="lg"
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white"
                    onClick={() => navigateLightbox("prev")}
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="lg"
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white"
                    onClick={() => navigateLightbox("next")}
                  >
                    <ChevronRight className="w-6 h-6" />
                  </Button>
                </>
              )}

              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/60 text-white px-4 py-2 rounded-full">
                {lightboxImageIndex + 1} / {lightboxProduct.images.length}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Contact Product Dialog */}
      <Dialog
        open={contactDialogOpen}
        onOpenChange={(open) => {
          setContactDialogOpen(open)
          if (!open) setContactProduct(null)
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Contacter le vendeur</DialogTitle>
            <DialogDescription>Produit: {contactProduct?.title}</DialogDescription>
          </DialogHeader>
          <ContactForm
            productId={contactProduct?.id ? Number.parseInt(contactProduct.id) : undefined}
            productName={contactProduct?.title}
            defaultMessage={
              contactProduct
                ? `Bonjour, je suis intéressé(e) par le produit "${contactProduct.title}" au prix de ${contactProduct.price}€. Pourriez-vous me donner plus d'informations ?`
                : ""
            }
            onSuccess={() => {
              setContactDialogOpen(false)
              setContactProduct(null)
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Contact Section */}
      <section id="contact" className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Intéressé par un produit ?</h2>
              <p className="text-xl text-gray-600">
                Contactez-nous pour plus d'informations, négocier le prix ou organiser un rendez-vous
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <Card className="p-6">
                <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-400 to-purple-600 rounded-full mx-auto mb-4">
                  <Phone className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-center">Appelez-nous</h3>
                <p className="text-gray-600 mb-4 text-center">Discutez directement avec notre équipe</p>
                <Button
                  className="w-full bg-gradient-to-r from-orange-500 to-purple-600"
                  onClick={() => window.open("tel:0745923538")}
                >
                  07 45 92 35 38
                </Button>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-400 to-purple-600 rounded-full mx-auto mb-4">
                  <Mail className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-center">Envoyez un message</h3>
                <p className="text-gray-600 mb-4 text-center">Décrivez le produit qui vous intéresse</p>
                <ContactForm />
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Location Section with Google Map */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Notre Magasin</h2>
              <p className="text-xl text-gray-600">Venez nous rendre visite à Saint-Étienne</p>
            </div>

            <div className="grid lg:grid-cols-2 gap-8 items-start">
              {/* Location Info */}
              <Card className="p-6 h-fit">
                <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-400 to-purple-600 rounded-full mx-auto mb-6">
                  <MapPin className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-semibold mb-4 text-center">MoreFix Saint-Étienne</h3>

                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <MapPin className="w-5 h-5 text-purple-600 mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-medium">Adresse</p>
                      <p className="text-gray-600">
                        10 Rue Mi-Carême
                        <br />
                        42000 Saint-Étienne
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Phone className="w-5 h-5 text-purple-600 mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-medium">Téléphone</p>
                      <p className="text-gray-600">07 45 92 35 38</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Mail className="w-5 h-5 text-purple-600 mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-medium">Email</p>
                      <p className="text-gray-600">contact@morefix.fr</p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t">
                  <h4 className="font-semibold mb-3">Horaires d'ouverture</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Mardi - Samedi</span>
                      <span className="text-gray-600">10h00 - 19h00</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Dimanche</span>
                      <span className="text-gray-600">Fermé</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Lundi</span>
                      <span className="text-gray-600">Fermé</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <Button
                    className="w-full bg-gradient-to-r from-orange-500 to-purple-600"
                    onClick={() =>
                      window.open("https://maps.google.com/?q=10+Rue+Mi-Carême,+42000+Saint-Étienne", "_blank")
                    }
                  >
                    <MapPin className="w-4 h-4 mr-2" />
                    Ouvrir dans Google Maps
                  </Button>
                </div>
              </Card>

              {/* Google Map */}
              <div className="relative">
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2782.8234567890123!2d4.3876543210987654!3d45.43876543210987!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47f5a9876543210f%3A0x1234567890abcdef!2s10%20Rue%20Mi-Car%C3%AAme%2C%2042000%20Saint-%C3%89tienne%2C%20France!5e0!3m2!1sfr!2sfr!4v1234567890123!5m2!1sfr!2sfr"
                    width="100%"
                    height="400"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="MoreFix Location - 10 Rue Mi-Carême, Saint-Étienne"
                    className="w-full h-96 lg:h-[500px]"
                  />
                </div>

                {/* Map overlay with business info */}
                <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm rounded-lg p-3 shadow-lg max-w-xs">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-3 h-3 bg-gradient-to-r from-orange-500 to-purple-600 rounded-full"></div>
                    <span className="font-semibold text-sm">MoreFix</span>
                  </div>
                  <p className="text-xs text-gray-600">10 Rue Mi-Carême</p>
                  <p className="text-xs text-gray-600">42000 Saint-Étienne</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="col-span-2">
              <Image
                src="/logo.png"
                alt="MoreFix Logo"
                width={150}
                height={50}
                className="h-12 w-auto mb-4 brightness-0 invert"
              />
              <p className="text-gray-400 mb-4 max-w-md">
                Votre marketplace de confiance pour les produits high-tech reconditionnés et neufs. Qualité garantie et
                prix compétitifs.
              </p>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">Catégories</h4>
              <ul className="space-y-2 text-gray-400">
                {categories.slice(1).map((category) => (
                  <li key={category}>
                    <button
                      className="block hover:text-white transition-colors text-left"
                      onClick={() => {
                        setSelectedCategory(category)
                        document.getElementById("products")?.scrollIntoView({ behavior: "smooth" })
                      }}
                    >
                      {category}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">Contact</h4>
              <div className="space-y-2 text-gray-400">
                <button
                  className="block hover:text-white transition-colors"
                  onClick={() => window.open("tel:0745923538")}
                >
                  📞 07 45 92 35 38
                </button>
                <button className="block hover:text-white transition-colors" onClick={scrollToContact}>
                  📧 contact@morefix.fr
                </button>
                <p>📍 10 Rue Mi-Carême, 42000 Saint-Étienne</p>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 MoreFix. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
