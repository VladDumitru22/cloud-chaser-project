"use client"

import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Search, ShoppingCart, Check } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

type Product = {
  id: string
  name: string
  description: string
  price: number
  duration: string
  features: string[]
}

const availableProducts: Product[] = [
  {
    id: "1",
    name: "Social Media Starter",
    description: "Perfect for small businesses starting their social media journey",
    price: 499,
    duration: "3 months",
    features: ["10 Posts per month", "2 Social platforms", "Basic analytics", "Email support"],
  },
  {
    id: "2",
    name: "Growth Package",
    description: "Accelerate your brand presence with comprehensive social media management",
    price: 999,
    duration: "6 months",
    features: [
      "25 Posts per month",
      "4 Social platforms",
      "Advanced analytics",
      "Priority support",
      "Monthly strategy calls",
    ],
  },
  {
    id: "3",
    name: "Enterprise Solution",
    description: "Full-scale social media marketing for established brands",
    price: 2499,
    duration: "12 months",
    features: [
      "Unlimited posts",
      "All platforms",
      "Real-time analytics",
      "24/7 dedicated support",
      "Weekly strategy sessions",
      "Custom campaigns",
    ],
  },
]

export function ProductsBrowser() {
  const { user } = useAuth()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [isPurchaseDialogOpen, setIsPurchaseDialogOpen] = useState(false)
  const [purchaseSuccess, setPurchaseSuccess] = useState(false)

  const filteredProducts = availableProducts.filter(
    (product) =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handlePurchase = (product: Product) => {
    setSelectedProduct(product)
    setIsPurchaseDialogOpen(true)
    setPurchaseSuccess(false)
  }

  const confirmPurchase = () => {
    // Simulate purchase
    setPurchaseSuccess(true)
    setTimeout(() => {
      setIsPurchaseDialogOpen(false)
      setPurchaseSuccess(false)
      setSelectedProduct(null)
    }, 2000)
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
        {filteredProducts.map((product) => (
          <Card key={product.id} className="flex flex-col border-border/50 shadow-lg shadow-primary/5">
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
                <span className="text-3xl font-bold text-foreground">${product.price}</span>
                <span className="text-sm text-muted-foreground">/ {product.duration}</span>
              </div>
              <div className="space-y-2">
                {product.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-primary" />
                    <span className="text-muted-foreground">{feature}</span>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full gap-2 bg-gradient-to-r from-primary to-secondary shadow-md shadow-primary/20"
                onClick={() => handlePurchase(product)}
              >
                <ShoppingCart className="h-4 w-4" />
                Purchase Product
              </Button>
            </CardFooter>
          </Card>
        ))}
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
                    <span className="text-sm text-muted-foreground">Duration</span>
                    <span className="font-medium">{selectedProduct?.duration}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Client</span>
                    <span className="font-medium">{user?.name}</span>
                  </div>
                  <div className="border-t border-border pt-2 mt-2 flex justify-between">
                    <span className="font-semibold">Total</span>
                    <span className="text-xl font-bold text-primary">${selectedProduct?.price}</span>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsPurchaseDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={confirmPurchase} className="bg-gradient-to-r from-primary to-secondary">
                  Confirm Purchase
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
                  Your product has been purchased and will be activated shortly.
                </DialogDescription>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
