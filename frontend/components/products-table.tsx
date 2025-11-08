"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Card } from "@/components/ui/card"
import { Plus, MoreVertical, Pencil, Trash2, Search, Loader2 } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"

type Product = {
  id_product: number
  name: string
  description: string | null
  monthly_price: string
  is_active: boolean
}

const API_URL = "http://localhost:8000"

export function ProductsTable() {
  const [products, setProducts] = useState<Product[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    monthly_price: "",
    is_active: "true",
  })
  const [isSaving, setIsSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const getToken = () => localStorage.getItem("cloudchaser_token")

  useEffect(() => {
    const loadProducts = async () => {
      setIsLoading(true)
      setError(null)
      const token = getToken()
      if (!token) {
        setError("User not authenticated.")
        setIsLoading(false)
        return
      }

      try {
        const res = await fetch(`${API_URL}/products-management/`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!res.ok) {
           const errData = await res.json()
           throw new Error(errData.detail || "Failed to fetch products")
        }
        const data: Product[] = await res.json()
        setProducts(data)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setIsLoading(false)
      }
    }
    loadProducts()
  }, [])

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const resetForm = () => {
    setFormData({ name: "", description: "", monthly_price: "", is_active: "true" })
    setFormError(null)
    setIsSaving(false)
  }

  const handleAdd = async () => {
    setIsSaving(true)
    setFormError(null)
    const token = getToken()

    try {
      const payload = {
        name: formData.name,
        description: formData.description || null,
        monthly_price: parseFloat(formData.monthly_price),
        is_active: formData.is_active === "true",
      }
      
      const res = await fetch(`${API_URL}/products-management/`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData.detail || "Failed to add product")
      }

      const newProduct: Product = await res.json()
      setProducts([...products, newProduct])
      resetForm()
      setIsAddDialogOpen(false)
    } catch (err: any) {
      setFormError(err.message)
    } finally {
      setIsSaving(false)
    }
  }

  const handleEdit = async () => {
    if (!editingProduct) return
    setIsSaving(true)
    setFormError(null)
    const token = getToken()

    try {
      const payload = {
        name: formData.name,
        description: formData.description || null,
        monthly_price: parseFloat(formData.monthly_price),
        is_active: formData.is_active === "true",
      }
      
      const res = await fetch(`${API_URL}/products-management/${editingProduct.id_product}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData.detail || "Failed to update product")
      }

      const updatedProduct: Product = await res.json()
      setProducts(
        products.map((p) => (p.id_product === updatedProduct.id_product ? updatedProduct : p)),
      )
      resetForm()
      setEditingProduct(null)
      setIsEditDialogOpen(false)
    } catch (err: any) {
      setFormError(err.message)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (id: number) => {
    setIsSaving(true)
    setError(null)
    const token = getToken()

    try {
      const res = await fetch(`${API_URL}/products-management/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData.detail || "Failed to delete product")
      }
      
      setProducts(products.filter((p) => p.id_product !== id))
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsSaving(false)
    }
  }

  const openEditDialog = (product: Product) => {
    setEditingProduct(product)
    setFormData({
      name: product.name,
      description: product.description || "",
      monthly_price: product.monthly_price,
      is_active: product.is_active.toString(),
    })
    setFormError(null)
    setIsEditDialogOpen(true)
  }
  
  if (isLoading) {
    return <div className="flex h-60 w-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
  }
  
  if (error && !isLoading) {
    return <div className="text-destructive p-4 text-center rounded-lg border border-destructive/50 bg-destructive/10">{error}</div>
  }

  return (
    <Card className="border-border/50 bg-card shadow-lg shadow-primary/5">
      <div className="p-6">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 sm:max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          <Dialog open={isAddDialogOpen} onOpenChange={(open) => { setIsAddDialogOpen(open); if (!open) resetForm(); }}>
            <DialogTrigger asChild>
              <Button className="gap-2 shadow-md shadow-primary/20">
                <Plus className="h-4 w-4" />
                Add Product
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Product</DialogTitle>
                <DialogDescription>Create a new product offering</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Product name" disabled={isSaving} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Input id="description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Product description" disabled={isSaving} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="price">Monthly Price ($)</Label>
                  <Input id="price" type="number" step="0.01" value={formData.monthly_price} onChange={(e) => setFormData({ ...formData, monthly_price: e.target.value })} placeholder="0.00" disabled={isSaving} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="is-active-add">Status</Label>
                  <Select value={formData.is_active} onValueChange={(value) => setFormData({ ...formData, is_active: value })} disabled={isSaving}>
                    <SelectTrigger id="is-active-add">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">Active</SelectItem>
                      <SelectItem value="false">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {formError && <p className="text-sm text-destructive">{formError}</p>}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} disabled={isSaving}>
                  Cancel
                </Button>
                <Button onClick={handleAdd} disabled={isSaving}>
                  {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Add Product"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="rounded-lg border border-border/50">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="font-semibold">ID</TableHead>
                <TableHead className="font-semibold">Name</TableHead>
                <TableHead className="font-semibold">Monthly Price</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="font-semibold">Description</TableHead>
                <TableHead className="w-[70px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                    No products found
                  </TableCell>
                </TableRow>
              ) : (
                filteredProducts.map((product) => (
                  <TableRow key={product.id_product}>
                    <TableCell className="font-mono text-sm">{product.id_product}</TableCell>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell className="font-mono">${parseFloat(product.monthly_price).toFixed(2)}</TableCell>
                    <TableCell>
                      <span
                        className={cn(
                          "inline-flex items-center rounded-md px-2 py-1 text-xs font-medium",
                          product.is_active
                            ? "bg-green-500/10 text-green-600 dark:text-green-400"
                            : "bg-gray-500/10 text-gray-600 dark:text-gray-400"
                        )}
                      >
                        {product.is_active ? "Active" : "Inactive"}
                      </span>
                    </TableCell>
                    <TableCell className="max-w-md truncate text-muted-foreground">{product.description || "N/A"}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                            <span className="sr-only">Open menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEditDialog(product)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(product.id_product)}
                            className="text-destructive focus:text-destructive"
                            disabled={isSaving}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <Dialog open={isEditDialogOpen} onOpenChange={(open) => { setIsEditDialogOpen(open); if (!open) resetForm(); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
            <DialogDescription>Update the product details</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">Name</Label>
              <Input id="edit-name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} disabled={isSaving} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-description">Description</Label>
              <Input id="edit-description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} disabled={isSaving} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-price">Monthly Price ($)</Label>
              <Input id="edit-price" type="number" step="0.01" value={formData.monthly_price} onChange={(e) => setFormData({ ...formData, monthly_price: e.target.value })} disabled={isSaving} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="is-active-edit">Status</Label>
              <Select value={formData.is_active} onValueChange={(value) => setFormData({ ...formData, is_active: value })} disabled={isSaving}>
                <SelectTrigger id="is-active-edit">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Active</SelectItem>
                  <SelectItem value="false">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {formError && <p className="text-sm text-destructive">{formError}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} disabled={isSaving}>
              Cancel
            </Button>
            <Button onClick={handleEdit} disabled={isSaving}>
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}