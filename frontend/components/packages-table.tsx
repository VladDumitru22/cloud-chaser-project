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

type Package = {
  id_product: number
  id_component: number
  quantity: number
  product_name: string
  component_name: string
}

type Product = {
  id_product: number
  name: string
}

type Component = {
  id_component: number
  name: string
}

const API_URL = "http://localhost:8000"

export function PackagesTable() {
  const [packages, setPackages] = useState<Package[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [components, setComponents] = useState<Component[]>([])
  
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  
  const [editingKey, setEditingKey] = useState<{ id_product: number; id_component: number } | null>(null)
  
  const [formData, setFormData] = useState({
    id_product: "",
    id_component: "",
    quantity: "",
  })
  const [isSaving, setIsSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const getToken = () => localStorage.getItem("cloudchaser_token")

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      setError(null)
      const token = getToken()
      if (!token) {
        setError("User not authenticated.")
        setIsLoading(false)
        return
      }
      const headers = { Authorization: `Bearer ${token}` }

      try {
        const [packagesRes, productsRes, componentsRes] = await Promise.all([
          fetch(`${API_URL}/packages-management/`, { headers }),
          fetch(`${API_URL}/products-management/`, { headers }),
          fetch(`${API_URL}/components-management/`, { headers }),
        ])

        if (!packagesRes.ok) throw new Error("Failed to fetch packages")
        if (!productsRes.ok) throw new Error("Failed to fetch products")
        if (!componentsRes.ok) throw new Error("Failed to fetch components")

        const packagesData: Package[] = await packagesRes.json()
        const productsData: Product[] = await productsRes.json()
        const componentsData: Component[] = await componentsRes.json()

        setPackages(packagesData)
        setProducts(productsData)
        setComponents(componentsData)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [])

  const filteredPackages = packages.filter(
    (pkg) =>
      pkg.product_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pkg.component_name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const resetForm = () => {
    setFormData({ id_product: "", id_component: "", quantity: "" })
    setFormError(null)
    setIsSaving(false)
  }

  const handleAdd = async () => {
    setIsSaving(true)
    setFormError(null)
    const token = getToken()

    try {
      const payload = {
        id_product: parseInt(formData.id_product),
        id_component: parseInt(formData.id_component),
        quantity: parseInt(formData.quantity),
      }
      
      const res = await fetch(`${API_URL}/packages-management/`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData.detail || "Failed to add package link")
      }

      const newPackage: Package = await res.json()
      setPackages([...packages, newPackage])
      resetForm()
      setIsAddDialogOpen(false)
    } catch (err: any) {
      setFormError(err.message)
    } finally {
      setIsSaving(false)
    }
  }

  const handleEdit = async () => {
    if (!editingKey) return
    setIsSaving(true)
    setFormError(null)
    const token = getToken()

    try {
      const payload = {
        quantity: parseInt(formData.quantity),
      }
      
      const res = await fetch(`${API_URL}/packages-management/${editingKey.id_product}/${editingKey.id_component}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData.detail || "Failed to update package link")
      }

      const updatedPackage: Package = await res.json()
      setPackages(
        packages.map((p) =>
          p.id_product === updatedPackage.id_product && p.id_component === updatedPackage.id_component
            ? updatedPackage
            : p,
        ),
      )
      resetForm()
      setEditingKey(null)
      setIsEditDialogOpen(false)
    } catch (err: any) {
      setFormError(err.message)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (id_product: number, id_component: number) => {
    setIsSaving(true)
    setError(null)
    const token = getToken()

    try {
      const res = await fetch(`${API_URL}/packages-management/${id_product}/${id_component}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData.detail || "Failed to delete package link")
      }
      
      setPackages(
        packages.filter((p) => !(p.id_product === id_product && p.id_component === id_component)),
      )
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsSaving(false)
    }
  }

  const openEditDialog = (pkg: Package) => {
    setEditingKey({ id_product: pkg.id_product, id_component: pkg.id_component })
    setFormData({
      id_product: pkg.id_product.toString(),
      id_component: pkg.id_component.toString(),
      quantity: pkg.quantity.toString(),
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
              placeholder="Search packages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          <Dialog open={isAddDialogOpen} onOpenChange={(open) => { setIsAddDialogOpen(open); if (!open) resetForm(); }}>
            <DialogTrigger asChild>
              <Button className="gap-2 shadow-md shadow-primary/20">
                <Plus className="h-4 w-4" />
                Add Package Link
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Link Component to Product</DialogTitle>
                <DialogDescription>Define the quantity of a component within a product</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="add-product">Product</Label>
                  <Select value={formData.id_product} onValueChange={(value) => setFormData({ ...formData, id_product: value })} disabled={isSaving}>
                    <SelectTrigger id="add-product">
                      <SelectValue placeholder="Select a product" />
                    </SelectTrigger>
                    <SelectContent>
                      {products.map((product) => (
                        <SelectItem key={product.id_product} value={product.id_product.toString()}>
                          {product.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="add-component">Component</Label>
                  <Select value={formData.id_component} onValueChange={(value) => setFormData({ ...formData, id_component: value })} disabled={isSaving}>
                    <SelectTrigger id="add-component">
                      <SelectValue placeholder="Select a component" />
                    </SelectTrigger>
                    <SelectContent>
                      {components.map((component) => (
                        <SelectItem key={component.id_component} value={component.id_component.toString()}>
                          {component.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="add-quantity">Quantity</Label>
                  <Input id="add-quantity" type="number" value={formData.quantity} onChange={(e) => setFormData({ ...formData, quantity: e.target.value })} placeholder="0" disabled={isSaving} />
                </div>
                {formError && <p className="text-sm text-destructive">{formError}</p>}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} disabled={isSaving}>
                  Cancel
                </Button>
                <Button onClick={handleAdd} disabled={isSaving}>
                  {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Add Link"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="rounded-lg border border-border/50">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="font-semibold">Product</TableHead>
                <TableHead className="font-semibold">Component</TableHead>
                <TableHead className="font-semibold">Quantity</TableHead>
                <TableHead className="w-[70px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPackages.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                    No packages found
                  </TableCell>
                </TableRow>
              ) : (
                filteredPackages.map((pkg) => (
                  <TableRow key={`${pkg.id_product}-${pkg.id_component}`}>
                    <TableCell className="font-medium">{pkg.product_name}</TableCell>
                    <TableCell className="text-muted-foreground">{pkg.component_name}</TableCell>
                    <TableCell className="font-mono">{pkg.quantity}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                            <span className="sr-only">Open menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEditDialog(pkg)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit Quantity
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(pkg.id_product, pkg.id_component)}
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
            <DialogTitle>Edit Package Quantity</DialogTitle>
            <DialogDescription>Update the quantity for this product-component link</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-product">Product</Label>
              <Input id="edit-product" value={products.find(p => p.id_product.toString() === formData.id_product)?.name || '...'} disabled />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-component">Component</Label>
              <Input id="edit-component" value={components.find(c => c.id_component.toString() === formData.id_component)?.name || '...'} disabled />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-quantity">Quantity</Label>
              <Input id="edit-quantity" type="number" value={formData.quantity} onChange={(e) => setFormData({ ...formData, quantity: e.target.value })} disabled={isSaving} />
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