"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Card } from "@/components/ui/card"
import { Plus, MoreVertical, Pencil, Trash2, Search } from "lucide-react"

type Product = {
  id: string
  name: string
}

type Component = {
  id: string
  name: string
}

type Package = {
  id: string
  id_product: string
  id_component: string
  quantity: number
  notes: string
}

const mockProducts: Product[] = [
  { id: "1", name: "Summer Campaign 2024" },
  { id: "2", name: "Product Launch Strategy" },
  { id: "3", name: "Brand Awareness Initiative" },
]

const mockComponents: Component[] = [
  { id: "1", name: "Social Media Post Template" },
  { id: "2", name: "Analytics Dashboard Widget" },
  { id: "3", name: "Content Calendar Module" },
]

const initialPackages: Package[] = [
  {
    id: "1",
    id_product: "1",
    id_component: "1",
    quantity: 50,
    notes: "Standard template package for summer campaign",
  },
  {
    id: "2",
    id_product: "2",
    id_component: "2",
    quantity: 3,
    notes: "Analytics widgets for launch tracking",
  },
  {
    id: "3",
    id_product: "3",
    id_component: "3",
    quantity: 1,
    notes: "Annual content planning module",
  },
]

export function PackagesTable() {
  const [packages, setPackages] = useState<Package[]>(initialPackages)
  const [searchQuery, setSearchQuery] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingPackage, setEditingPackage] = useState<Package | null>(null)
  const [formData, setFormData] = useState({
    id_product: "",
    id_component: "",
    quantity: "",
    notes: "",
  })

  const getProductName = (productId: string) => {
    return mockProducts.find((p) => p.id === productId)?.name || "Unknown Product"
  }

  const getComponentName = (componentId: string) => {
    return mockComponents.find((c) => c.id === componentId)?.name || "Unknown Component"
  }

  const filteredPackages = packages.filter(
    (pkg) =>
      getProductName(pkg.id_product).toLowerCase().includes(searchQuery.toLowerCase()) ||
      getComponentName(pkg.id_component).toLowerCase().includes(searchQuery.toLowerCase()) ||
      pkg.notes.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleAdd = () => {
    const newPackage: Package = {
      id: (packages.length + 1).toString(),
      id_product: formData.id_product,
      id_component: formData.id_component,
      quantity: Number.parseInt(formData.quantity),
      notes: formData.notes,
    }
    setPackages([...packages, newPackage])
    setFormData({ id_product: "", id_component: "", quantity: "", notes: "" })
    setIsAddDialogOpen(false)
  }

  const handleEdit = () => {
    if (!editingPackage) return
    setPackages(
      packages.map((p) =>
        p.id === editingPackage.id
          ? {
              ...p,
              id_product: formData.id_product,
              id_component: formData.id_component,
              quantity: Number.parseInt(formData.quantity),
              notes: formData.notes,
            }
          : p,
      ),
    )
    setFormData({ id_product: "", id_component: "", quantity: "", notes: "" })
    setEditingPackage(null)
    setIsEditDialogOpen(false)
  }

  const handleDelete = (id: string) => {
    setPackages(packages.filter((p) => p.id !== id))
  }

  const openEditDialog = (pkg: Package) => {
    setEditingPackage(pkg)
    setFormData({
      id_product: pkg.id_product,
      id_component: pkg.id_component,
      quantity: pkg.quantity.toString(),
      notes: pkg.notes,
    })
    setIsEditDialogOpen(true)
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

          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 shadow-md shadow-primary/20">
                <Plus className="h-4 w-4" />
                Add Package
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Package</DialogTitle>
                <DialogDescription>Create a new package linking products and components</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="product">Product</Label>
                  <Select
                    value={formData.id_product}
                    onValueChange={(value) => setFormData({ ...formData, id_product: value })}
                  >
                    <SelectTrigger id="product">
                      <SelectValue placeholder="Select a product" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockProducts.map((product) => (
                        <SelectItem key={product.id} value={product.id}>
                          {product.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="component">Component</Label>
                  <Select
                    value={formData.id_component}
                    onValueChange={(value) => setFormData({ ...formData, id_component: value })}
                  >
                    <SelectTrigger id="component">
                      <SelectValue placeholder="Select a component" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockComponents.map((component) => (
                        <SelectItem key={component.id} value={component.id}>
                          {component.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input
                    id="quantity"
                    type="number"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    placeholder="0"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Additional notes about this package"
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAdd}>Add Package</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="rounded-lg border border-border/50">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="font-semibold">ID</TableHead>
                <TableHead className="font-semibold">Product</TableHead>
                <TableHead className="font-semibold">Component</TableHead>
                <TableHead className="font-semibold">Quantity</TableHead>
                <TableHead className="font-semibold">Notes</TableHead>
                <TableHead className="w-[70px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPackages.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                    No packages found
                  </TableCell>
                </TableRow>
              ) : (
                filteredPackages.map((pkg) => (
                  <TableRow key={pkg.id}>
                    <TableCell className="font-mono text-sm">{pkg.id}</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center rounded-md bg-secondary/20 px-2 py-1 text-xs font-medium text-secondary-foreground">
                        {getProductName(pkg.id_product)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                        {getComponentName(pkg.id_component)}
                      </span>
                    </TableCell>
                    <TableCell className="font-mono">{pkg.quantity}</TableCell>
                    <TableCell className="max-w-md truncate text-muted-foreground">{pkg.notes}</TableCell>
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
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(pkg.id)}
                            className="text-destructive focus:text-destructive"
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

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Package</DialogTitle>
            <DialogDescription>Update the package details</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-product">Product</Label>
              <Select
                value={formData.id_product}
                onValueChange={(value) => setFormData({ ...formData, id_product: value })}
              >
                <SelectTrigger id="edit-product">
                  <SelectValue placeholder="Select a product" />
                </SelectTrigger>
                <SelectContent>
                  {mockProducts.map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-component">Component</Label>
              <Select
                value={formData.id_component}
                onValueChange={(value) => setFormData({ ...formData, id_component: value })}
              >
                <SelectTrigger id="edit-component">
                  <SelectValue placeholder="Select a component" />
                </SelectTrigger>
                <SelectContent>
                  {mockComponents.map((component) => (
                    <SelectItem key={component.id} value={component.id}>
                      {component.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-quantity">Quantity</Label>
              <Input
                id="edit-quantity"
                type="number"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-notes">Notes</Label>
              <Textarea
                id="edit-notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEdit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
