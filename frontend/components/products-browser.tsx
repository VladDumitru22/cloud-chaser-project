"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Search, ShoppingCart, Check, Loader2, AlertCircle } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

type ComponentDetail = {
  name: string
  quantity: number
}

type Product = {
  id_product: number
  name: string
  description: string
  monthly_price: number
  components: ComponentDetail[]
}

const API_URL = "http://localhost:8000"

export function ProductsBrowser() {
  const { user } = useAuth()
  const [searchQuery, setSearchQuery] = useState("")

  const [products, setProducts] = useState<Product[]>([])
  const [ownedProductIds, setOwnedProductIds] = useState<number[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [isPurchaseDialogOpen, setIsPurchaseDialogOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [purchaseSuccess, setPurchaseSuccess] = useState(false)

  const getToken = () => localStorage.getItem("cloudchaser_token")

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      const token = getToken()
      if (!token) {
        setError("User not authenticated.")
        setIsLoading(false)
        return
      }

      const headers = { Authorization: `Bearer ${token}` }

      try {
        const [productsRes, ownedIdsRes] = await Promise.all([
          fetch(`${API_URL}/products/list`, { headers }),
          fetch(`${API_URL}/subscriptions/my-active-ids`, { headers }),
        ])

        if (!productsRes.ok) throw new Error("Failed to fetch products")
        if (!ownedIdsRes.ok) throw new Error("Failed to fetch owned products")

        const productsData: Product[] = await productsRes.json()
        const ownedIdsData: number[] = await ownedIdsRes.json()

        setProducts(productsData)
        setOwnedProductIds(ownedIdsData)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [])

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handlePurchase = (product: Product) => {
    setSelectedProduct(product)
    setIsPurchaseDialogOpen(true)
    setPurchaseSuccess(false)
    setFormError(null)
  }

  const confirmPurchase = async () => {
    if (!selectedProduct) return

    setIsSaving(true)
    setFormError(null)
    const token = getToken()

      try {
          const res = await fetch(`${API_URL}/subscriptions/`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ id_product: selectedProduct.id_product }),
          })

      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData.detail || "Purchase failed")
      }

      const newSubscription = await res.json()

      setOwnedProductIds((prev) => [...prev, newSubscription.id_product])

      setPurchaseSuccess(true) 
      setTimeout(() => {
        setIsPurchaseDialogOpen(false)
        setSelectedProduct(null)
      }, 2000)
    } catch (err: any) {
      setFormError(err.message)
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-60 w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center text-center text-destructive">
        <AlertCircle className="h-12 w-12 mb-4" />
        <h3 className="text-lg font-semibold mb-2">Failed to load products</h3>
        <p className="text-sm">{error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search products..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredProducts.map((product) => {
          const isOwned = ownedProductIds.includes(product.id_product)

          return (
            <Card key={product.id_product} className="flex flex-col border-border/50 shadow-lg shadow-primary/5">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-xl">{product.name}</CardTitle>
                    <CardDescription className="mt-2">{product.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-1 space-y-4">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-foreground">${product.monthly_price}</span>
                  <span className="text-sm text-muted-foreground">/ month</span>
                </div>
                <div className="space-y-2">
                  {product.components.map((component, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-primary" />
                      <span className="text-muted-foreground">
                        {component.quantity}x {component.name}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full gap-2"
                  variant={isOwned ? "outline" : "default"} 
                  onClick={() => handlePurchase(product)}
                  disabled={isOwned} 
                >
                  {isOwned ? (
                    <>
                      <Check className="h-4 w-4" />
                      Already Subscribed
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="h-4 w-4" />
                      Purchase Product
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          )
        })}
      </div>

      <Dialog open={isPurchaseDialogOpen} onOpenChange={setIsPurchaseDialogOpen}>
        <DialogContent>
          {!purchaseSuccess ? (
            <>
              <DialogHeader>
                <DialogTitle>Confirm Purchase</DialogTitle>
                <DialogDescription>Review your purchase details before confirming</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="rounded-lg bg-muted/50 p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Product</span>
                    <span className="font-medium">{selectedProduct?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Billing</span>
                    <span className="font-medium">Per Month</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Client</span>
                    <span className="font-medium">{user?.name}</span>
                  </div>
                  <div className="border-t border-border pt-2 mt-2 flex justify-between">
                    <span className="font-semibold">Total (Monthly)</span>
                    <span className="text-xl font-bold text-primary">
                      ${selectedProduct?.monthly_price}
                    </span>
                  </div>
                </div>

                {formError && (
                  <div className="flex items-center gap-2 text-sm text-destructive">
                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                    <p>{formError}</p>
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsPurchaseDialogOpen(false)}
                  disabled={isSaving}
                >
                  Cancel
                </Button>
                <Button onClick={confirmPurchase} disabled={isSaving}>
                  {isSaving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Confirm Purchase"
                  )}
                </Button>
              </DialogFooter>
            </>
          ) : (
            <div className="py-8 text-center space-y-4">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-500/10">
                <Check className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <DialogTitle className="text-xl">Purchase Successful!</DialogTitle>
                <DialogDescription className="mt-2">
                  Your new subscription is now active.
                </DialogDescription>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}